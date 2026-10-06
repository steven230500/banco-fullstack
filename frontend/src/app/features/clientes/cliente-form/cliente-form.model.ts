import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { Cliente, ClienteCreateRequest, ClienteUpdateRequest, Genero } from '@core/models';
import { entero, noVacio } from '@shared/forms/validators';

export const PATRON_CLIENTE_ID = /^[a-zA-Z0-9._-]{3,20}$/;
export const PATRON_IDENTIFICACION = /^\d{10,13}$/;
export const PATRON_TELEFONO = /^\d{7,15}$/;

export function crearFormularioCliente(fb: NonNullableFormBuilder) {
  return fb.group({
    clienteId: fb.control('', [Validators.required, Validators.pattern(PATRON_CLIENTE_ID)]),
    nombre: fb.control('', [Validators.required, noVacio, Validators.maxLength(100)]),
    genero: fb.control<Genero | ''>('', Validators.required),
    edad: fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(120),
      entero,
    ]),
    identificacion: fb.control('', [
      Validators.required,
      Validators.pattern(PATRON_IDENTIFICACION),
    ]),
    direccion: fb.control('', [Validators.required, noVacio, Validators.maxLength(200)]),
    telefono: fb.control('', [Validators.required, Validators.pattern(PATRON_TELEFONO)]),
    contrasena: fb.control('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(72),
    ]),
    estado: fb.control(true),
  });
}

export type FormularioCliente = ReturnType<typeof crearFormularioCliente>;
export type ValorFormularioCliente = ReturnType<FormularioCliente['getRawValue']>;

export function configurarEdicionCliente(form: FormularioCliente, cliente: Cliente): void {
  form.controls.clienteId.disable();
  form.controls.contrasena.setValidators([Validators.minLength(4), Validators.maxLength(72)]);
  form.controls.contrasena.updateValueAndValidity();
  form.patchValue({
    clienteId: cliente.clienteId,
    nombre: cliente.nombre,
    genero: cliente.genero,
    edad: cliente.edad,
    identificacion: cliente.identificacion,
    direccion: cliente.direccion,
    telefono: cliente.telefono,
    contrasena: '',
    estado: cliente.estado,
  });
}

function datosComunes(v: ValorFormularioCliente) {
  return {
    nombre: v.nombre.trim(),
    genero: v.genero as Genero,
    edad: Number(v.edad),
    identificacion: v.identificacion.trim(),
    direccion: v.direccion.trim(),
    telefono: v.telefono.trim(),
    estado: v.estado,
  };
}

export function aClienteCreateRequest(v: ValorFormularioCliente): ClienteCreateRequest {
  return { clienteId: v.clienteId.trim(), ...datosComunes(v), contrasena: v.contrasena };
}

export function aClienteUpdateRequest(v: ValorFormularioCliente): ClienteUpdateRequest {
  return v.contrasena ? { ...datosComunes(v), contrasena: v.contrasena } : datosComunes(v);
}
