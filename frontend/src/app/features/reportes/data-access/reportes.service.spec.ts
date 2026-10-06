import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ESTADO_CUENTA, REPORTE_PDF } from '@testing/fixtures';
import { ReportesService } from './reportes.service';

describe('ReportesService', () => {
  const params = { clienteId: 'mmontalvo', fechaInicio: '2022-02-01', fechaFin: '2022-02-10' };
  let servicio: ReportesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(ReportesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('obtiene el estado de cuenta con clienteId, fechaInicio y fechaFin', () => {
    let resultado: unknown;
    servicio.obtener(params).subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/reportes');
    expect(req.request.method).toBe('GET');
    expect(req.request.urlWithParams).toBe(
      '/api/reportes?clienteId=mmontalvo&fechaInicio=2022-02-01&fechaFin=2022-02-10',
    );
    req.flush(ESTADO_CUENTA);
    expect(resultado).toEqual(ESTADO_CUENTA);
  });

  it('obtiene el PDF en base64 con los mismos parámetros', () => {
    let resultado: unknown;
    servicio.obtenerPdf(params).subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/reportes/pdf');
    expect(req.request.params.get('clienteId')).toBe('mmontalvo');
    expect(req.request.params.get('fechaFin')).toBe('2022-02-10');
    req.flush(REPORTE_PDF);
    expect(resultado).toEqual(REPORTE_PDF);
  });
});
