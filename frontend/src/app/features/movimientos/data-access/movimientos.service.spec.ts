import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MOVIMIENTOS, MOVIMIENTO_RETIRO } from '@testing/fixtures';
import { MovimientosService, paramsDeFiltro } from './movimientos.service';

describe('paramsDeFiltro', () => {
  it('omite filtros vacíos', () => {
    const params = paramsDeFiltro({
      numeroCuenta: '478758',
      clienteId: '',
      fechaInicio: '2026-10-01',
    });
    expect(params.keys()).toEqual(['numeroCuenta', 'fechaInicio']);
    expect(paramsDeFiltro().keys()).toEqual([]);
  });
});

describe('MovimientosService', () => {
  let servicio: MovimientosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(MovimientosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista con filtros como query params', () => {
    let resultado: unknown;
    servicio
      .listar({ clienteId: 'jlema', fechaFin: '2026-10-31' })
      .subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/movimientos');
    expect(req.request.params.get('clienteId')).toBe('jlema');
    expect(req.request.params.get('fechaFin')).toBe('2026-10-31');
    req.flush(MOVIMIENTOS);
    expect(resultado).toEqual(MOVIMIENTOS);
  });

  it('crea con POST enviando el valor positivo', () => {
    const request = { numeroCuenta: '478758', tipoMovimiento: 'RETIRO' as const, valor: 575 };
    servicio.crear(request).subscribe();
    const req = http.expectOne({ method: 'POST', url: '/api/movimientos' });
    expect(req.request.body).toEqual(request);
    req.flush(MOVIMIENTO_RETIRO);
  });

  it('obtiene, actualiza con PUT y elimina por id', () => {
    servicio.obtener(10).subscribe();
    http.expectOne({ method: 'GET', url: '/api/movimientos/10' }).flush(MOVIMIENTO_RETIRO);

    servicio.actualizar(10, { tipoMovimiento: 'DEPOSITO', valor: 100 }).subscribe();
    const put = http.expectOne({ method: 'PUT', url: '/api/movimientos/10' });
    expect(put.request.body).toEqual({ tipoMovimiento: 'DEPOSITO', valor: 100 });
    put.flush(MOVIMIENTO_RETIRO);

    servicio.eliminar(10).subscribe();
    http.expectOne({ method: 'DELETE', url: '/api/movimientos/10' }).flush(null);
  });
});
