import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function maxDecimales(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }
    const texto = String(valor);
    const decimales = texto.includes('.') ? texto.split('.')[1].length : 0;
    return decimales > max ? { maxDecimales: { max, actual: decimales } } : null;
  };
}

export function entero(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }
  return Number.isInteger(Number(valor)) ? null : { entero: true };
}

export function noVacio(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  return typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0
    ? { required: true }
    : null;
}

export function rangoFechas(desde: string, hasta: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const inicio = grupo.get(desde)?.value as string | null;
    const fin = grupo.get(hasta)?.value as string | null;
    return inicio && fin && inicio > fin ? { rangoFechas: true } : null;
  };
}

export function mayorQueCero(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }
  return Number(valor) > 0 ? null : { mayorQueCero: true };
}
