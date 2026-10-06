import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiError } from '@core/http/api-error';
import { NotificationService } from '@core/notifications/notification.service';
import { CLIENTES, CLIENTE_JLEMA } from '@testing/fixtures';
import { allByTestId, byTestId, clic, escribir, estabilizar } from '@testing/dom';
import { of, throwError } from 'rxjs';
import { ClientesService } from '../data-access/clientes.service';
import { ClienteListPage } from './cliente-list.page';

describe('ClienteListPage', () => {
  let servicio: { listar: jest.Mock; eliminar: jest.Mock };

  async function crear() {
    const fixture = TestBed.createComponent(ClienteListPage);
    await estabilizar(fixture);
    return fixture;
  }

  const nombres = (fixture: Parameters<typeof estabilizar>[0]) =>
    allByTestId(fixture, 'table-row').map((f) =>
      f.querySelector('[data-testid="celda-nombre"]')?.textContent?.trim(),
    );

  beforeEach(() => {
    servicio = { listar: jest.fn(() => of(CLIENTES)), eliminar: jest.fn(() => of(undefined)) };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ClientesService, useValue: servicio }],
    });
  });

  it('carga y muestra los clientes con sus columnas', async () => {
    const fixture = await crear();

    expect(byTestId(fixture, 'page-title')?.textContent).toBe('Clientes');
    expect(servicio.listar).toHaveBeenCalledTimes(1);
    expect(nombres(fixture)).toEqual(['Jose Lema', 'Juan Osorio', 'Marianela Montalvo']);
    const primera = allByTestId(fixture, 'table-row')[0];
    expect(primera.getAttribute('data-row-key')).toBe('jlema');
    expect(primera.textContent).toContain('Masculino');
    expect(primera.textContent).toContain('Activo');
    expect(byTestId<HTMLAnchorElement>(fixture, 'btn-nuevo')?.getAttribute('href')).toBe(
      '/clientes/nuevo',
    );
    expect(byTestId<HTMLAnchorElement>(fixture, 'btn-editar')?.getAttribute('href')).toBe(
      '/clientes/jlema/editar',
    );
  });

  it('filtra con la búsqueda rápida sin distinguir tildes ni mayúsculas', async () => {
    const fixture = await crear();

    escribir(byTestId<HTMLInputElement>(fixture, 'search-input')!, 'MARIÁNELA');
    await estabilizar(fixture);
    expect(nombres(fixture)).toEqual(['Marianela Montalvo']);

    escribir(byTestId<HTMLInputElement>(fixture, 'search-input')!, 'inactivo');
    await estabilizar(fixture);
    expect(nombres(fixture)).toEqual(['Juan Osorio']);

    escribir(byTestId<HTMLInputElement>(fixture, 'search-input')!, 'zzz');
    await estabilizar(fixture);
    expect(byTestId(fixture, 'empty-state')?.textContent).toContain('No hay registros');
  });

  it('elimina tras confirmar, notifica y recarga', async () => {
    const fixture = await crear();
    const notificaciones = TestBed.inject(NotificationService);

    clic(allByTestId(fixture, 'btn-eliminar')[0]);
    await estabilizar(fixture);
    expect(byTestId(fixture, 'confirm-dialog')?.textContent).toContain('Jose Lema');

    servicio.listar.mockReturnValue(of(CLIENTES.slice(1)));
    clic(byTestId(fixture, 'btn-confirmar'));
    await estabilizar(fixture);

    expect(servicio.eliminar).toHaveBeenCalledWith(CLIENTE_JLEMA.clienteId);
    expect(byTestId(fixture, 'confirm-dialog')).toBeNull();
    expect(notificaciones.notificaciones()[0]).toMatchObject({
      tipo: 'exito',
      mensaje: 'Cliente Jose Lema eliminado',
    });
    expect(servicio.listar).toHaveBeenCalledTimes(2);
    expect(nombres(fixture)).toEqual(['Juan Osorio', 'Marianela Montalvo']);
  });

  it('no elimina si se cancela la confirmación', async () => {
    const fixture = await crear();

    clic(allByTestId(fixture, 'btn-eliminar')[0]);
    await estabilizar(fixture);
    clic(byTestId(fixture, 'btn-cancelar-confirmacion'));
    await estabilizar(fixture);

    expect(byTestId(fixture, 'confirm-dialog')).toBeNull();
    expect(servicio.eliminar).not.toHaveBeenCalled();
  });

  it('muestra el 409 del backend cuando el cliente tiene cuentas', async () => {
    servicio.eliminar.mockReturnValue(
      throwError(
        () => new ApiError(409, 'El cliente tiene cuentas asociadas', 'OPERACION_NO_PERMITIDA'),
      ),
    );
    const fixture = await crear();

    clic(allByTestId(fixture, 'btn-eliminar')[0]);
    await estabilizar(fixture);
    clic(byTestId(fixture, 'btn-confirmar'));
    await estabilizar(fixture);

    expect(TestBed.inject(NotificationService).notificaciones()[0]).toMatchObject({
      tipo: 'error',
      mensaje: 'El cliente tiene cuentas asociadas',
    });
    expect(byTestId(fixture, 'confirm-dialog')).toBeNull();
    expect(servicio.listar).toHaveBeenCalledTimes(1);
  });

  it('muestra una alerta si falla la carga', async () => {
    servicio.listar.mockReturnValue(
      throwError(() => new ApiError(0, 'No se pudo conectar con el servidor.')),
    );
    const fixture = await crear();

    expect(byTestId(fixture, 'alert-error')?.textContent).toContain('No se pudo conectar');
    expect(allByTestId(fixture, 'table-row')).toHaveLength(0);
  });
});
