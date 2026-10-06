import { base64ABlob, descargarArchivoBase64 } from './download-file';

async function textoDe(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.readAsText(blob);
  });
}

describe('base64ABlob', () => {
  it('decodifica el contenido con el tipo indicado', async () => {
    const blob = base64ABlob('JVBERi0xLjQ=', 'application/pdf');

    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBe(8);
    expect(await textoDe(blob)).toBe('%PDF-1.4');
  });

  it('tolera prefijo data: y saltos de línea', async () => {
    const blob = base64ABlob('data:application/pdf;base64,JVBE\nRi0x\nLjQ=', 'application/pdf');
    expect(await textoDe(blob)).toBe('%PDF-1.4');
  });
});

describe('descargarArchivoBase64', () => {
  const crearUrl = jest.fn(() => 'blob:http://localhost/123');
  const revocarUrl = jest.fn();

  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', { value: crearUrl, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revocarUrl, configurable: true });
    crearUrl.mockClear();
    revocarUrl.mockClear();
  });

  it('crea un enlace temporal con el nombre del archivo, hace clic y libera la URL', () => {
    const clic = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe('estado.pdf');
      expect(this.href).toBe('blob:http://localhost/123');
      expect(document.body.contains(this)).toBe(true);
    });

    descargarArchivoBase64({
      nombreArchivo: 'estado.pdf',
      contentType: 'application/pdf',
      contenidoBase64: 'JVBERi0xLjQ=',
    });

    expect(clic).toHaveBeenCalledTimes(1);
    const blob = crearUrl.mock.calls[0] as unknown as [Blob];
    expect(blob[0].type).toBe('application/pdf');
    expect(revocarUrl).toHaveBeenCalledWith('blob:http://localhost/123');
    expect(document.querySelector('a[download]')).toBeNull();
    clic.mockRestore();
  });

  it('libera la URL aunque el clic falle y usa un tipo genérico si falta contentType', () => {
    const clic = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    expect(() =>
      descargarArchivoBase64({ nombreArchivo: 'x.bin', contentType: '', contenidoBase64: 'AA==' }),
    ).toThrow('bloqueado');

    const [blob] = crearUrl.mock.calls[0] as unknown as [Blob];
    expect(blob.type).toBe('application/octet-stream');
    expect(revocarUrl).toHaveBeenCalled();
    clic.mockRestore();
  });
});
