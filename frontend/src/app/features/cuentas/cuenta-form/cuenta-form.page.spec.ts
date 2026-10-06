import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ApiError } from '@core/http/api-error';
import { CLIENTES, CUENTA_478758 } from '@testing/fixtures';
import { byTestId, clic, escribir, estabilizar } from '@testing/dom';
import { of, throwError } from 'rxjs';
import { ClientesService } from '../../clientes/data-access/clientes.service';
import { CuentasService } from '../data-access/cuentas.service';
import { CuentaFormPage } from './cuenta-form.page';

type Fixture = Parameters<typeof estabilizar>[0];
const campo = (fixture: Fixture, nombre: string) =>
  byTestId<HTMLInputElement>(fixture, `input-${nombre}`)!;
const select = (fixture: Fixture, nombre: string) =>
  byTestId<HTMLSelectElement>(fixture, `input-${nombre}`)!;

describe('CuentaFormPage', () => {
  let cuentas: { obtener: jest.Mock; crear: jest.Mock; actualizar: jest.Mock };
  let clientes: { listar: jest.Mock };
  let navegar: jest.SpyInstance;

  beforeEach(() => {
    cuentas = {
      obtener: jest.fn(() => of(CUENTA_478758)),
      crear: jest.fn(() => of(CUENTA_478758)),
      actualizar: jest.fn(() => of(CUENTA_478758)),
    };
    clientes = { listar: jest.fn(() => of(CLIENTES)) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: CuentasService, useValue: cuentas },
        { provide: ClientesService, useValue: clientes },
      ],
    });
    navegar = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  async function crear(numeroCuenta?: string) {
    const fixture = TestBed.createComponent(CuentaFormPage);
    if (numeroCuenta) {
      fixture.componentRef.setInput('numeroCuenta', numeroCuenta);
    }
    await estabilizar(fixture);
    return fixture;
  }

  it('ofrece solo clientes activos en el alta', async () => {
    const fixture = await crear();
    const opciones = Array.from(select(fixture, 'clienteId').options).map((o) => o.value);
    expect(opciones).toEqual(['', 'jlema', 'mmontalvo']);
  });

  it('valida número de cuenta, saldo y decimales', async () => {
    const fixture = await crear();
    escribir(campo(fixture, 'numeroCuenta'), '12a');
    escribir(campo(fixture, 'saldoInicial'), '-1');
    await estabilizar(fixture);

    expect(byTestId(fixture, 'field-error-numeroCuenta')?.textContent).toContain(
      'formato no es válido',
    );
    expect(byTestId(fixture, 'field-error-saldoInicial')?.textContent).toContain('mínimo es 0');

    escribir(campo(fixture, 'saldoInicial'), '10.123');
    await estabilizar(fixture);
    expect(byTestId(fixture, 'field-error-saldoInicial')?.textContent).toContain('2 decimales');

    clic(byTestId(fixture, 'btn-guardar'));
    await estabilizar(fixture);
    expect(cuentas.crear).not.toHaveBeenCalled();
  });

  it('crea la cuenta con POST', async () => {
    const fixture = await crear();
    escribir(campo(fixture, 'numeroCuenta'), '585545');
    escribir(select(fixture, 'clienteId'), 'jlema');
    escribir(select(fixture, 'tipoCuenta'), 'CORRIENTE');
    escribir(campo(fixture, 'saldoInicial'), '1000');

    clic(byTestId(fixture, 'btn-guardar'));
    await estabilizar(fixture);

    expect(cuentas.crear).toHaveBeenCalledWith({
      numeroCuenta: '585545',
      tipoCuenta: 'CORRIENTE',
      saldoInicial: 1000,
      estado: true,
      clienteId: 'jlema',
    });
    expect(navegar).toHaveBeenCalledWith('/cuentas');
  });

  it('edita con PUT y muestra el 409 si se cambia el saldo con movimientos', async () => {
    cuentas.actualizar.mockReturnValue(
      throwError(
        () => new ApiError(409, 'No se puede cambiar el saldo inicial', 'OPERACION_NO_PERMITIDA'),
      ),
    );
    const fixture = await crear('478758');

    expect(campo(fixture, 'numeroCuenta').disabled).toBe(true);
    expect(select(fixture, 'clienteId').disabled).toBe(true);
    escribir(campo(fixture, 'saldoInicial'), '2500');
    clic(byTestId(fixture, 'btn-guardar'));
    await estabilizar(fixture);

    expect(cuentas.actualizar).toHaveBeenCalledWith('478758', {
      tipoCuenta: 'AHORROS',
      saldoInicial: 2500,
      estado: true,
    });
    expect(byTestId(fixture, 'alert-error')?.textContent).toContain(
      'No se puede cambiar el saldo inicial',
    );
    expect(navegar).not.toHaveBeenCalled();
  });

  it('muestra un error si no se pueden cargar los clientes o la cuenta', async () => {
    clientes.listar.mockReturnValue(throwError(() => new ApiError(500, 'Error interno')));
    cuentas.obtener.mockReturnValue(throwError(() => new ApiError(404, 'Cuenta no encontrada')));
    const fixture = await crear('000000');

    expect(byTestId(fixture, 'alert-error')?.textContent).toContain('Cuenta no encontrada');
  });
});
