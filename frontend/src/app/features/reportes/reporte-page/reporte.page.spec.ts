import { TestBed } from '@angular/core/testing';
import { ApiError } from '@core/http/api-error';
import { NotificationService } from '@core/notifications/notification.service';
import * as descarga from '@shared/download/download-file';
import { CLIENTES, ESTADO_CUENTA, REPORTE_PDF } from '@testing/fixtures';
import { allByTestId, byTestId, clic, escribir, estabilizar, textOf } from '@testing/dom';
import { of, throwError } from 'rxjs';
import { ClientesService } from '../../clientes/data-access/clientes.service';
import { ReportesService } from '../data-access/reportes.service';
import { ReportePage } from './reporte.page';
import { crearFormularioReporte } from './reporte-filtro.model';
import { NonNullableFormBuilder } from '@angular/forms';

type Fixture = Parameters<typeof estabilizar>[0];

jest.mock('@shared/download/download-file', () => ({
  descargarArchivoBase64: jest.fn(),
}));

function filtrar(fixture: Fixture, clienteId: string, inicio: string, fin: string) {
  escribir(byTestId<HTMLSelectElement>(fixture, 'input-clienteId')!, clienteId);
  escribir(byTestId<HTMLInputElement>(fixture, 'input-fechaInicio')!, inicio);
  escribir(byTestId<HTMLInputElement>(fixture, 'input-fechaFin')!, fin);
}

describe('ReportePage', () => {
  let reportes: { obtener: jest.Mock; obtenerPdf: jest.Mock };

  beforeEach(() => {
    reportes = {
      obtener: jest.fn(() => of(ESTADO_CUENTA)),
      obtenerPdf: jest.fn(() => of(REPORTE_PDF)),
    };
    (descarga.descargarArchivoBase64 as jest.Mock).mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: ReportesService, useValue: reportes },
        { provide: ClientesService, useValue: { listar: jest.fn(() => of(CLIENTES)) } },
      ],
    });
  });

  async function crear() {
    const fixture = TestBed.createComponent(ReportePage);
    await estabilizar(fixture);
    return fixture;
  }

  it('propone el mes en curso y carga los clientes', async () => {
    const fixture = await crear();
    const opciones = Array.from(byTestId<HTMLSelectElement>(fixture, 'input-clienteId')!.options);

    expect(opciones.map((o) => o.value)).toEqual(['', 'jlema', 'josorio', 'mmontalvo']);
    expect(byTestId<HTMLInputElement>(fixture, 'input-fechaInicio')?.value).toMatch(
      /^\d{4}-\d{2}-01$/,
    );
    expect(byTestId(fixture, 'reporte-resumen')).toBeNull();
  });

  it('valida cliente obligatorio y rango de fechas', async () => {
    const fixture = await crear();
    filtrar(fixture, '', '2022-02-10', '2022-02-01');

    clic(byTestId(fixture, 'btn-generar'));
    await estabilizar(fixture);

    expect(textOf(fixture, 'field-error-clienteId')).toBe('Este campo es obligatorio.');
    expect(textOf(fixture, 'field-error-rango')).toBe(
      'La fecha inicio no puede ser posterior a la fecha fin.',
    );
    expect(reportes.obtener).not.toHaveBeenCalled();
  });

  it('genera el reporte y muestra totales, cuentas y movimientos', async () => {
    const fixture = await crear();
    filtrar(fixture, 'mmontalvo', '2022-02-01', '2022-02-10');

    clic(byTestId(fixture, 'btn-generar'));
    await estabilizar(fixture);

    expect(reportes.obtener).toHaveBeenCalledWith({
      clienteId: 'mmontalvo',
      fechaInicio: '2022-02-01',
      fechaFin: '2022-02-10',
    });
    expect(textOf(fixture, 'reporte-resumen')).toContain('Marianela Montalvo');
    expect(textOf(fixture, 'total-creditos')).toBe('$600.00');
    expect(textOf(fixture, 'total-debitos')).toBe('-$540.00');
    expect(allByTestId(fixture, 'reporte-cuenta')).toHaveLength(2);
    expect(
      allByTestId(fixture, 'cuenta-saldo-disponible').map((e) => e.textContent?.trim()),
    ).toEqual(['$700.00', '$0.00']);

    const filas = allByTestId(fixture, 'table-row');
    expect(filas).toHaveLength(2);
    expect(filas[0].textContent).toContain('10/02/2022');
    expect(filas[0].textContent).toContain('Corriente');
    expect(filas[1].querySelector('[data-testid="celda-movimiento"]')?.textContent?.trim()).toBe(
      '-$540.00',
    );
  });

  it('filtra los movimientos del reporte con la búsqueda rápida', async () => {
    const fixture = await crear();
    filtrar(fixture, 'mmontalvo', '2022-02-01', '2022-02-10');
    clic(byTestId(fixture, 'btn-generar'));
    await estabilizar(fixture);

    escribir(byTestId<HTMLInputElement>(fixture, 'search-input')!, 'ahorros');
    await estabilizar(fixture);

    expect(allByTestId(fixture, 'table-row').map((f) => f.textContent)).toEqual([
      expect.stringContaining('496825'),
    ]);
  });

  it('muestra los errores del backend al generar', async () => {
    reportes.obtener.mockReturnValue(
      throwError(
        () => new ApiError(400, 'fechaInicio debe ser anterior a fechaFin', 'SOLICITUD_INVALIDA'),
      ),
    );
    const fixture = await crear();
    filtrar(fixture, 'jlema', '2022-02-01', '2022-02-10');

    clic(byTestId(fixture, 'btn-generar'));
    await estabilizar(fixture);

    expect(textOf(fixture, 'alert-error')).toContain('fechaInicio debe ser anterior a fechaFin');
  });

  it('descarga el PDF con los filtros actuales', async () => {
    const fixture = await crear();
    filtrar(fixture, 'mmontalvo', '2022-02-01', '2022-02-10');

    clic(byTestId(fixture, 'btn-descargar-pdf'));
    await estabilizar(fixture);

    expect(reportes.obtenerPdf).toHaveBeenCalledWith({
      clienteId: 'mmontalvo',
      fechaInicio: '2022-02-01',
      fechaFin: '2022-02-10',
    });
    expect(descarga.descargarArchivoBase64).toHaveBeenCalledWith(REPORTE_PDF, document);
    expect(TestBed.inject(NotificationService).notificaciones()[0].mensaje).toContain(
      REPORTE_PDF.nombreArchivo,
    );
    expect(byTestId<HTMLButtonElement>(fixture, 'btn-descargar-pdf')?.disabled).toBe(false);
  });

  it('no descarga el PDF con filtros inválidos y notifica errores de la API', async () => {
    const fixture = await crear();
    clic(byTestId(fixture, 'btn-descargar-pdf'));
    await estabilizar(fixture);
    expect(reportes.obtenerPdf).not.toHaveBeenCalled();

    reportes.obtenerPdf.mockReturnValue(
      throwError(() => new ApiError(404, 'Cliente no encontrado')),
    );
    filtrar(fixture, 'jlema', '2022-02-01', '2022-02-10');
    clic(byTestId(fixture, 'btn-descargar-pdf'));
    await estabilizar(fixture);

    expect(descarga.descargarArchivoBase64).not.toHaveBeenCalled();
    expect(TestBed.inject(NotificationService).notificaciones()[0]).toMatchObject({
      tipo: 'error',
      mensaje: 'Cliente no encontrado',
    });
  });
});

describe('crearFormularioReporte', () => {
  it('usa del primer día del mes hasta hoy', () => {
    const form = TestBed.runInInjectionContext(() =>
      crearFormularioReporte(TestBed.inject(NonNullableFormBuilder), new Date(2026, 9, 6)),
    );
    expect(form.getRawValue()).toEqual({
      clienteId: '',
      fechaInicio: '2026-10-01',
      fechaFin: '2026-10-06',
    });
  });
});
