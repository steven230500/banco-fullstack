import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import { ClienteCreateRequest } from '@core/models';
import { CLIENTES, CLIENTE_JLEMA } from '@testing/fixtures';
import { ClientesService } from './clientes.service';

describe('ClientesService', () => {
  let servicio: ClientesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(ClientesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista clientes con GET /api/clientes', () => {
    let resultado: unknown;
    servicio.listar().subscribe((r) => (resultado = r));

    const req = http.expectOne('/api/clientes');
    expect(req.request.method).toBe('GET');
    req.flush(CLIENTES);
    expect(resultado).toEqual(CLIENTES);
  });

  it('obtiene un cliente codificando el identificador', () => {
    servicio.obtener('j lema').subscribe();
    expect(http.expectOne('/api/clientes/j%20lema').request.method).toBe('GET');
  });

  it('crea con POST y el cuerpo del contrato', () => {
    const request: ClienteCreateRequest = { ...CLIENTE_JLEMA, contrasena: '1234' };
    servicio.crear(request).subscribe();

    const req = http.expectOne('/api/clientes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(CLIENTE_JLEMA, { status: 201, statusText: 'Created' });
  });

  it('actualiza con PUT', () => {
    const { nombre, genero, edad, identificacion, direccion, telefono, estado } = CLIENTE_JLEMA;
    const cuerpo = { nombre, genero, edad, identificacion, direccion, telefono, estado };
    servicio.actualizar('jlema', cuerpo).subscribe();

    const req = http.expectOne('/api/clientes/jlema');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(cuerpo);
    req.flush(CLIENTE_JLEMA);
  });

  it('elimina con DELETE', () => {
    servicio.eliminar('jlema').subscribe();
    const req = http.expectOne('/api/clientes/jlema');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('respeta un API_BASE_URL configurado', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api:8080/api' },
      ],
    });
    const otro = TestBed.inject(ClientesService);
    const controlador = TestBed.inject(HttpTestingController);

    otro.listar().subscribe();
    controlador.expectOne('http://api:8080/api/clientes').flush([]);
    controlador.verify();
    http = controlador;
  });
});
