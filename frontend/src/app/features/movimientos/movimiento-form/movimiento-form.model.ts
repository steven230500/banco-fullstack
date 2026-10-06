import { NonNullableFormBuilder, Validators } from '@angular/forms';
import {
  Movimiento,
  MovimientoRequest,
  MovimientoUpdateRequest,
  TipoMovimiento,
} from '@core/models';
import { mayorQueCero, maxDecimales } from '@shared/forms/validators';

export function crearFormularioMovimiento(fb: NonNullableFormBuilder) {
  return fb.group({
    numeroCuenta: fb.control('', Validators.required),
    tipoMovimiento: fb.control<TipoMovimiento | ''>('', Validators.required),
    valor: fb.control<number | null>(null, [Validators.required, mayorQueCero, maxDecimales(2)]),
  });
}

export type FormularioMovimiento = ReturnType<typeof crearFormularioMovimiento>;
export type ValorFormularioMovimiento = ReturnType<FormularioMovimiento['getRawValue']>;

export function configurarEdicionMovimiento(form: FormularioMovimiento, m: Movimiento): void {
  form.controls.numeroCuenta.disable();
  form.patchValue({
    numeroCuenta: m.numeroCuenta,
    tipoMovimiento: m.tipoMovimiento,
    valor: Math.abs(m.valor),
  });
}

export function aMovimientoRequest(v: ValorFormularioMovimiento): MovimientoRequest {
  return {
    numeroCuenta: v.numeroCuenta,
    tipoMovimiento: v.tipoMovimiento as TipoMovimiento,
    valor: Number(v.valor),
  };
}

export function aMovimientoUpdateRequest(v: ValorFormularioMovimiento): MovimientoUpdateRequest {
  return { tipoMovimiento: v.tipoMovimiento as TipoMovimiento, valor: Number(v.valor) };
}
