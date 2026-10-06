import {
  HttpClient,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { ApiError } from './api-error';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  function configurar(interceptores: HttpInterceptorFn[]) {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors(interceptores)), provideHttpClientTesting()],
    });
    return { http: TestBed.inject(HttpClient), controlador: TestBed.inject(HttpTestingController) };
  }

  it('convierte la respuesta Problem Details en ApiError', () => {
    const { http, controlador } = configurar([errorInterceptor]);
    let recibido: unknown;

    http.post('/api/movimientos', {}).subscribe({ error: (e) => (recibido = e) });
    controlador
      .expectOne('/api/movimientos')
      .flush(
        { status: 422, detail: 'Cupo diario Excedido', codigo: 'CUPO_DIARIO_EXCEDIDO' },
        { status: 422, statusText: 'Unprocessable Entity' },
      );

    expect(recibido).toBeInstanceOf(ApiError);
    expect((recibido as ApiError).detalle).toBe('Cupo diario Excedido');
    expect((recibido as ApiError).codigo).toBe('CUPO_DIARIO_EXCEDIDO');
    controlador.verify();
  });

  it('convierte un error de red en ApiError con status 0', () => {
    const { http, controlador } = configurar([errorInterceptor]);
    let recibido: ApiError | undefined;

    http.get('/api/clientes').subscribe({ error: (e) => (recibido = e) });
    controlador.expectOne('/api/clientes').error(new ProgressEvent('error'));

    expect(recibido?.status).toBe(0);
  });

  it('no altera las respuestas exitosas', () => {
    const { http, controlador } = configurar([errorInterceptor]);
    let recibido: unknown;

    http.get('/api/clientes').subscribe((r) => (recibido = r));
    controlador.expectOne('/api/clientes').flush([{ clienteId: 'jlema' }]);

    expect(recibido).toEqual([{ clienteId: 'jlema' }]);
  });

  it('propaga sin cambios los errores que no son HTTP', () => {
    const original = new Error('fallo local');
    const falla: HttpInterceptorFn = () => throwError(() => original);
    const { http } = configurar([errorInterceptor, falla]);
    let recibido: unknown;

    http.get('/api/clientes').subscribe({ error: (e) => (recibido = e) });

    expect(recibido).toBe(original);
  });
});
