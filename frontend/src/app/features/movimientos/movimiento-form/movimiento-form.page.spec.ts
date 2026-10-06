import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ApiError } from '@core/http/api-error';
import { NotificationService } from '@core/notifications/notification.service';
import { CUENTAS, MOVIMIENTO_RETIRO } from '@testing/fixtures';
import { byTestId, clic, escribir, estabilizar } from '@testing/dom';
import { of, throwError } from 'rxjs';
import { CuentasService } from '../../cuentas/data-access/cuentas.service';
import { MovimientosService } from '../data-access/movimientos.service';
import { MovimientoFormPage } from './movimiento-form.page';

type Fixture = Parameters<typeof estabilizar>[0];
const control = <T extends HTMLElement>(fixture: Fixture, nombre: string) =>
  byTestId<T>(fixture, `input-${nombre}`)!;

describe('MovimientoFormPage', () => {
  let movimientos: { obtener: jest.Mock; crear: jest.Mock; actualizar: jest.Mock };
  let cuentas: { listar: jest.Mock };
  let navegar: jest.SpyInstance;

  beforeEach(() => {
    movimientos = {
      obtener: jest.fn(() => of(MOVIMIENTO_RETIRO)),
      crear: jest.fn(() => of(MOVIMIENTO_RETIRO)),
      actualizar: jest.fn(() => of(MOVIMIENTO_RETIRO)),
    };
    cuentas = { listar: jest.fn(() => of(CUENTAS)) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: MovimientosService, useValue: movimientos },
        { provide: CuentasService, useValue: cuentas },
      ],
    });
    navegar = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  async function crear(id?: string) {
    const fixture = TestBed.createComponent(MovimientoFormPage);
    if (id) {
      fixture.componentRef.setInput('id', id);
    }
    await estabilizar(fixture);
    return fixture;
  }

  it('lista solo cuentas activas y muestra el saldo de la seleccionada', async () => {
    const fixture = await crear();
    const select = control<HTMLSelectElement>(fixture, 'numeroCuenta');

    expect(Array.from(select.options).map((o) => o.value)).toEqual(['', '225487', '478758']);
    escribir(select, '478758');
    await estabilizar(fixture);
    expect(byTestId(fixture, 'saldo-cuenta')?.textContent).toContain('$1,425.00');
  });

  it('exige cuenta, tipo y valor mayor que 0 con 2 decimales', async () => {
    const fixture = await crear();

    clic(byTestId(fixture, 'btn-guardar'));
    await estabilizar(fixture);
    expect(byTestId(fixture, 'field-error-numeroCuenta')?.textContent).toContain('obligatorio');
    expect(byTestId(fixture, 'field-error-tipoMovimiento')?.textContent).toContain('obligatorio');
    expect(byTestId(fixture, 'field-error-valor')?.textContent).toContain('obligatorio');

    escribir(control<HTMLInputElement>(fixture, 'valor'), '0');
    await estabilizar(fixture);
    expect(byTestId(fixture, 'field-error-valor')?.textContent?.trim()).toBe(
      'Debe ser mayor que 0.',
    );

    escribir(control<HTMLInputElement>(fixture, 'valor'), '10.555');
    await estabilizar(fixture);
    expect(byTestId(fixture, 'field-error-valor')?.textContent).toContain('2 decimales');
    expect(movimientos.crear).not.toHaveBeenCalled();
  });

  it('registra el movimiento con POST y notifica', async () => {
    const fixture = await crear();
    escribir(control<HTMLSelectElement>(fixture, 'numeroCuenta'), '478758');
    escribir(control<HTMLSelectElement>(fixture, 'tipoMovimiento'), 'RETIRO');
    escribir(control<HTMLInputElement>(fixture, 'valor'), '575');

    clic(byTestId(fixture, 'btn-guardar'));
    await estabilizar(fixture);

    expect(movimientos.crear).toHaveBeenCalledWith({
      numeroCuenta: '478758',
      tipoMovimiento: 'RETIRO',
      valor: 575,
    });
    expect(TestBed.inject(NotificationService).notificaciones()[0].mensaje).toBe(
      'Movimiento registrado',
    );
    expect(navegar).toHaveBeenCalledWith('/movimientos');
  });

  it('muestra "Saldo no disponible" (422) en una alerta visible', async () => {
    movimientos.crear.mockReturnValue(
      throwError(() => new ApiError(422, 'Saldo no disponible', 'SALDO_NO_DISPONIBLE')),
    );
    const fixture = await crear();
    escribir(control<HTMLSelectElement>(fixture, 'numeroCuenta'), '225487');
    escribir(control<HTMLSelectElement>(fixture, 'tipoMovimiento'), 'RETIRO');
    escribir(control<HTMLInputElement>(fixture, 'valor'), '5000');

    clic(byTestId(fixture, 'btn-guardar'));
    await estabilizar(fixture);

    expect(byTestId(fixture, 'alert-error')?.textContent).toContain('Saldo no disponible');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('en edición precarga el valor absoluto y actualiza con PUT', async () => {
    const fixture = await crear('10');

    expect(movimientos.obtener).toHaveBeenCalledWith(10);
    expect(control<HTMLSelectElement>(fixture, 'numeroCuenta').disabled).toBe(true);
    expect(control<HTMLInputElement>(fixture, 'valor').value).toBe('575');
    expect(byTestId(fixture, 'alert-info')?.textContent).toContain('último movimiento');

    escribir(control<HTMLInputElement>(fixture, 'valor'), '500');
    clic(byTestId(fixture, 'btn-guardar'));
    await estabilizar(fixture);

    expect(movimientos.actualizar).toHaveBeenCalledWith(10, {
      tipoMovimiento: 'RETIRO',
      valor: 500,
    });
  });

  it('muestra los errores de carga', async () => {
    cuentas.listar.mockReturnValue(throwError(() => new ApiError(500, 'Error interno')));
    const fixture = await crear();
    expect(byTestId(fixture, 'alert-error')?.textContent).toContain('Error interno');

    movimientos.obtener.mockReturnValue(
      throwError(() => new ApiError(404, 'Movimiento no encontrado')),
    );
    const otro = await crear('99');
    expect(byTestId(otro, 'alert-error')?.textContent).toContain('Movimiento no encontrado');
  });
});
