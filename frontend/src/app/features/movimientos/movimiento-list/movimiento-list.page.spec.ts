import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiError } from '@core/http/api-error';
import { NotificationService } from '@core/notifications/notification.service';
import { MOVIMIENTOS } from '@testing/fixtures';
import { allByTestId, byTestId, clic, escribir, estabilizar } from '@testing/dom';
import { of, throwError } from 'rxjs';
import { MovimientosService } from '../data-access/movimientos.service';
import { MovimientoListPage } from './movimiento-list.page';

describe('MovimientoListPage', () => {
  let servicio: { listar: jest.Mock; eliminar: jest.Mock };

  beforeEach(() => {
    servicio = { listar: jest.fn(() => of(MOVIMIENTOS)), eliminar: jest.fn(() => of(undefined)) };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: MovimientosService, useValue: servicio }],
    });
  });

  it('muestra fecha, tipo y montos con signo y color', async () => {
    const fixture = TestBed.createComponent(MovimientoListPage);
    await estabilizar(fixture);

    const [retiro, deposito] = allByTestId(fixture, 'table-row');
    expect(retiro.querySelector('[data-testid="celda-fecha"]')?.textContent?.trim()).toBe(
      '06/10/2026 01:20',
    );
    expect(retiro.querySelector('[data-testid="celda-valor"]')?.textContent?.trim()).toBe(
      '-$575.00',
    );
    expect(retiro.querySelector('[data-testid="celda-valor"]')?.className).toContain(
      'monto--debito',
    );
    expect(deposito.querySelector('.badge--credito')?.textContent?.trim()).toBe('Depósito');
  });

  it('filtra por tipo y muestra el 409 al eliminar un movimiento que no es el último', async () => {
    servicio.eliminar.mockReturnValue(
      throwError(
        () => new ApiError(409, 'Solo se puede eliminar el último movimiento de la cuenta'),
      ),
    );
    const fixture = TestBed.createComponent(MovimientoListPage);
    await estabilizar(fixture);

    escribir(byTestId<HTMLInputElement>(fixture, 'search-input')!, 'deposito');
    await estabilizar(fixture);
    expect(allByTestId(fixture, 'table-row')).toHaveLength(1);

    clic(byTestId(fixture, 'btn-eliminar'));
    await estabilizar(fixture);
    clic(byTestId(fixture, 'btn-confirmar'));
    await estabilizar(fixture);

    expect(servicio.eliminar).toHaveBeenCalledWith(11);
    expect(TestBed.inject(NotificationService).notificaciones()[0]).toMatchObject({
      tipo: 'error',
      mensaje: 'Solo se puede eliminar el último movimiento de la cuenta',
    });
  });
});
