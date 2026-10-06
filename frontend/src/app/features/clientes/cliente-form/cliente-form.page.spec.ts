import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ApiError } from '@core/http/api-error';
import { NotificationService } from '@core/notifications/notification.service';
import { CLIENTE_JLEMA } from '@testing/fixtures';
import { byTestId, clic, escribir, estabilizar } from '@testing/dom';
import { of, throwError } from 'rxjs';
import { ClientesService } from '../data-access/clientes.service';
import { ClienteFormPage } from './cliente-form.page';

type Fixture = Parameters<typeof estabilizar>[0];

function campo(fixture: Fixture, nombre: string) {
  return byTestId<HTMLInputElement>(fixture, `input-${nombre}`)!;
}

function llenarFormularioValido(fixture: Fixture) {
  escribir(campo(fixture, 'clienteId'), 'jlema');
  escribir(campo(fixture, 'nombre'), '  Jose Lema ');
  escribir(campo(fixture, 'genero') as unknown as HTMLSelectElement, 'MASCULINO');
  escribir(campo(fixture, 'edad'), '35');
  escribir(campo(fixture, 'identificacion'), '1712345678');
  escribir(campo(fixture, 'direccion'), 'Otavalo sn y principal');
  escribir(campo(fixture, 'telefono'), '098254785');
  escribir(campo(fixture, 'contrasena'), '1234');
}

describe('ClienteFormPage', () => {
  let servicio: { obtener: jest.Mock; crear: jest.Mock; actualizar: jest.Mock };
  let navegar: jest.SpyInstance;

  beforeEach(() => {
    servicio = {
      obtener: jest.fn(() => of(CLIENTE_JLEMA)),
      crear: jest.fn(() => of(CLIENTE_JLEMA)),
      actualizar: jest.fn(() => of(CLIENTE_JLEMA)),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ClientesService, useValue: servicio }],
    });
    navegar = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  async function crear(clienteId?: string) {
    const fixture = TestBed.createComponent(ClienteFormPage);
    if (clienteId) {
      fixture.componentRef.setInput('clienteId', clienteId);
    }
    await estabilizar(fixture);
    return fixture;
  }

  it('muestra los errores de validación al enviar vacío y no llama a la API', async () => {
    const fixture = await crear();
    expect(byTestId(fixture, 'page-title')?.textContent).toBe('Nuevo cliente');

    clic(byTestId(fixture, 'btn-guardar'));
    await estabilizar(fixture);

    expect(byTestId(fixture, 'alert-error')?.textContent).toContain('Revise los campos marcados');
    for (const nombre of [
      'clienteId',
      'nombre',
      'genero',
      'edad',
      'identificacion',
      'direccion',
      'telefono',
      'contrasena',
    ]) {
      expect(byTestId(fixture, `field-error-${nombre}`)?.textContent?.trim()).toBe(
        'Este campo es obligatorio.',
      );
    }
    expect(campo(fixture, 'nombre').getAttribute('aria-invalid')).toBe('true');
    expect(servicio.crear).not.toHaveBeenCalled();
  });

  it('valida patrones y rangos del contrato', async () => {
    const fixture = await crear();

    escribir(campo(fixture, 'clienteId'), 'a b');
    escribir(campo(fixture, 'edad'), '121');
    escribir(campo(fixture, 'identificacion'), '123');
    escribir(campo(fixture, 'telefono'), 'abc');
    escribir(campo(fixture, 'contrasena'), '12');
    await estabilizar(fixture);

    expect(byTestId(fixture, 'field-error-clienteId')?.textContent).toContain(
      'formato no es válido',
    );
    expect(byTestId(fixture, 'field-error-edad')?.textContent).toContain('máximo es 120');
    expect(byTestId(fixture, 'field-error-identificacion')?.textContent).toContain(
      'formato no es válido',
    );
    expect(byTestId(fixture, 'field-error-telefono')?.textContent).toContain(
      'formato no es válido',
    );
    expect(byTestId(fixture, 'field-error-contrasena')?.textContent).toContain('al menos 4');

    escribir(campo(fixture, 'edad'), '20.5');
    await estabilizar(fixture);
    expect(byTestId(fixture, 'field-error-edad')?.textContent).toContain('número entero');
  });

  it('crea el cliente con POST, notifica y vuelve al listado', async () => {
    const fixture = await crear();
    llenarFormularioValido(fixture);

    clic(byTestId(fixture, 'btn-guardar'));
    await estabilizar(fixture);

    expect(servicio.crear).toHaveBeenCalledWith({
      clienteId: 'jlema',
      nombre: 'Jose Lema',
      genero: 'MASCULINO',
      edad: 35,
      identificacion: '1712345678',
      direccion: 'Otavalo sn y principal',
      telefono: '098254785',
      contrasena: '1234',
      estado: true,
    });
    expect(TestBed.inject(NotificationService).notificaciones()[0].mensaje).toBe('Cliente creado');
    expect(navegar).toHaveBeenCalledWith('/clientes');
  });

  it('muestra el error del backend y lo asocia al campo', async () => {
    servicio.crear.mockReturnValue(
      throwError(
        () =>
          new ApiError(
            409,
            'Ya existe un cliente con esa identificación',
            'RECURSO_DUPLICADO',
            null,
            [{ campo: 'identificacion', mensaje: 'ya está registrada' }],
          ),
      ),
    );
    const fixture = await crear();
    llenarFormularioValido(fixture);

    clic(byTestId(fixture, 'btn-guardar'));
    await estabilizar(fixture);

    expect(byTestId(fixture, 'alert-error')?.textContent).toContain(
      'Ya existe un cliente con esa identificación',
    );
    expect(byTestId(fixture, 'field-error-identificacion')?.textContent?.trim()).toBe(
      'ya está registrada',
    );
    expect(navegar).not.toHaveBeenCalled();
    expect(byTestId<HTMLButtonElement>(fixture, 'btn-guardar')?.disabled).toBe(false);
  });

  it('en edición carga el cliente, bloquea clienteId y actualiza con PUT sin contraseña', async () => {
    const fixture = await crear('jlema');

    expect(servicio.obtener).toHaveBeenCalledWith('jlema');
    expect(byTestId(fixture, 'page-title')?.textContent).toBe('Editar cliente');
    expect(campo(fixture, 'clienteId').disabled).toBe(true);
    expect(campo(fixture, 'nombre').value).toBe('Jose Lema');

    escribir(campo(fixture, 'telefono'), '0999999999');
    clic(byTestId(fixture, 'btn-guardar'));
    await estabilizar(fixture);

    expect(servicio.actualizar).toHaveBeenCalledWith('jlema', {
      nombre: 'Jose Lema',
      genero: 'MASCULINO',
      edad: 35,
      identificacion: '1712345678',
      direccion: 'Otavalo sn y principal',
      telefono: '0999999999',
      estado: true,
    });
    expect(TestBed.inject(NotificationService).notificaciones()[0].mensaje).toBe(
      'Cliente actualizado',
    );
  });

  it('en edición envía la contraseña solo si se escribe una nueva', async () => {
    const fixture = await crear('jlema');
    escribir(campo(fixture, 'contrasena'), 'nueva-clave');

    clic(byTestId(fixture, 'btn-guardar'));
    await estabilizar(fixture);

    expect(servicio.actualizar.mock.calls[0][1]).toMatchObject({ contrasena: 'nueva-clave' });
  });

  it('muestra un error si el cliente a editar no existe', async () => {
    servicio.obtener.mockReturnValue(throwError(() => new ApiError(404, 'Cliente no encontrado')));
    const fixture = await crear('nadie');

    expect(byTestId(fixture, 'alert-error')?.textContent).toContain('Cliente no encontrado');
  });
});
