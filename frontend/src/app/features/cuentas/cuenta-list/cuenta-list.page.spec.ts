import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiError } from '@core/http/api-error';
import { NotificationService } from '@core/notifications/notification.service';
import { CUENTAS } from '@testing/fixtures';
import { allByTestId, byTestId, clic, escribir, estabilizar } from '@testing/dom';
import { of, throwError } from 'rxjs';
import { CuentasService } from '../data-access/cuentas.service';
import { CuentaListPage } from './cuenta-list.page';

describe('CuentaListPage', () => {
  let servicio: { listar: jest.Mock; eliminar: jest.Mock };

  beforeEach(() => {
    servicio = { listar: jest.fn(() => of(CUENTAS)), eliminar: jest.fn(() => of(undefined)) };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: CuentasService, useValue: servicio }],
    });
  });

  it('muestra las cuentas con saldos formateados y filtra por cliente', async () => {
    const fixture = TestBed.createComponent(CuentaListPage);
    await estabilizar(fixture);

    const filas = allByTestId(fixture, 'table-row');
    expect(filas).toHaveLength(3);
    expect(filas[1].textContent).toContain('$1,425.00');
    expect(filas[1].textContent).toContain('Ahorros');

    escribir(byTestId<HTMLInputElement>(fixture, 'search-input')!, 'jose');
    await estabilizar(fixture);
    expect(allByTestId(fixture, 'table-row').map((f) => f.getAttribute('data-row-key'))).toEqual([
      '478758',
    ]);
  });

  it('muestra el 409 si la cuenta tiene movimientos', async () => {
    servicio.eliminar.mockReturnValue(
      throwError(() => new ApiError(409, 'La cuenta tiene movimientos', 'OPERACION_NO_PERMITIDA')),
    );
    const fixture = TestBed.createComponent(CuentaListPage);
    await estabilizar(fixture);

    clic(allByTestId(fixture, 'btn-eliminar')[0]);
    await estabilizar(fixture);
    clic(byTestId(fixture, 'btn-confirmar'));
    await estabilizar(fixture);

    expect(servicio.eliminar).toHaveBeenCalledWith('225487');
    expect(TestBed.inject(NotificationService).notificaciones()[0].mensaje).toBe(
      'La cuenta tiene movimientos',
    );
  });
});
