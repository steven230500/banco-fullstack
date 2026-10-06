import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { Cuenta, CuentaCreateRequest, CuentaUpdateRequest, TipoCuenta } from '@core/models';
import { maxDecimales } from '@shared/forms/validators';

export const PATRON_NUMERO_CUENTA = /^\d{6,20}$/;

export function crearFormularioCuenta(fb: NonNullableFormBuilder) {
  return fb.group({
    numeroCuenta: fb.control('', [Validators.required, Validators.pattern(PATRON_NUMERO_CUENTA)]),
    clienteId: fb.control('', Validators.required),
    tipoCuenta: fb.control<TipoCuenta | ''>('', Validators.required),
    saldoInicial: fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      maxDecimales(2),
    ]),
    estado: fb.control(true),
  });
}

export type FormularioCuenta = ReturnType<typeof crearFormularioCuenta>;
export type ValorFormularioCuenta = ReturnType<FormularioCuenta['getRawValue']>;

export function configurarEdicionCuenta(form: FormularioCuenta, cuenta: Cuenta): void {
  form.controls.numeroCuenta.disable();
  form.controls.clienteId.disable();
  form.patchValue({
    numeroCuenta: cuenta.numeroCuenta,
    clienteId: cuenta.clienteId,
    tipoCuenta: cuenta.tipoCuenta,
    saldoInicial: cuenta.saldoInicial,
    estado: cuenta.estado,
  });
}

export function aCuentaCreateRequest(v: ValorFormularioCuenta): CuentaCreateRequest {
  return {
    numeroCuenta: v.numeroCuenta.trim(),
    tipoCuenta: v.tipoCuenta as TipoCuenta,
    saldoInicial: Number(v.saldoInicial),
    estado: v.estado,
    clienteId: v.clienteId,
  };
}

export function aCuentaUpdateRequest(v: ValorFormularioCuenta): CuentaUpdateRequest {
  return {
    tipoCuenta: v.tipoCuenta as TipoCuenta,
    saldoInicial: Number(v.saldoInicial),
    estado: v.estado,
  };
}
