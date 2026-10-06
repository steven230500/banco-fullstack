export interface ArchivoBase64 {
  nombreArchivo: string;
  contentType: string;
  contenidoBase64: string;
}

export function base64ABlob(base64: string, contentType: string): Blob {
  const limpio = base64.replace(/^data:[^,]*,/, '').replace(/\s/g, '');
  const binario = atob(limpio);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType });
}

export function descargarArchivoBase64(archivo: ArchivoBase64, doc: Document = document): void {
  const blob = base64ABlob(
    archivo.contenidoBase64,
    archivo.contentType || 'application/octet-stream',
  );
  const url = URL.createObjectURL(blob);
  const enlace = doc.createElement('a');
  enlace.href = url;
  enlace.download = archivo.nombreArchivo;
  enlace.rel = 'noopener';
  enlace.style.display = 'none';
  doc.body.appendChild(enlace);
  try {
    enlace.click();
  } finally {
    enlace.remove();
    URL.revokeObjectURL(url);
  }
}
