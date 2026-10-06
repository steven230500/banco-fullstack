import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CUENTAS, CUENTA_478758 } from '@testing/fixtures';
import { CuentasService } from './cuentas.service';

describe('CuentasService', () => {
  let servicio: CuentasService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(CuentasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista todas las cuentas sin parámetros', () => {
    let resultado: unknown;
    servicio.listar().subscribe((r) => (resultado = r));

    const req = http.expectOne('/api/cuentas');
    expect(req.request.params.keys()).toEqual([]);
    req.flush(CUENTAS);
    expect(resultado).toEqual(CUENTAS);
  });

  it('filtra por clienteId', () => {
    servicio.listar('jlema').subscribe();
    const req = http.expectOne((r) => r.url === '/api/cuentas');
    expect(req.request.params.get('clienteId')).toBe('jlema');
    req.flush([]);
  });

  it('obtiene, crea, actualiza (PUT) y elimina', () => {
    servicio.obtener('478758').subscribe();
    expect(http.expectOne('/api/cuentas/478758').request.method).toBe('GET');

    const alta = {
      numeroCuenta: '478758',
      tipoCuenta: 'AHORROS' as const,
      saldoInicial: 2000,
      estado: true,
      clienteId: 'jlema',
    };
    servicio.crear(alta).subscribe();
    const post = http.expectOne({ method: 'POST', url: '/api/cuentas' });
    expect(post.request.body).toEqual(alta);
    post.flush(CUENTA_478758);

    const cambio = { tipoCuenta: 'CORRIENTE' as const, saldoInicial: 2000, estado: false };
    servicio.actualizar('478758', cambio).subscribe();
    const put = http.expectOne({ method: 'PUT', url: '/api/cuentas/478758' });
    expect(put.request.body).toEqual(cambio);
    put.flush(CUENTA_478758);

    servicio.eliminar('478758').subscribe();
    http.expectOne({ method: 'DELETE', url: '/api/cuentas/478758' }).flush(null);
  });
});
