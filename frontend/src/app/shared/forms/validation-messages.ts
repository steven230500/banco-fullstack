import { ValidationErrors } from '@angular/forms';

export function mensajeValidacion(errores: ValidationErrors | null | undefined): string | null {
  if (!errores) {
    return null;
  }
  const [clave] = Object.keys(errores);
  const detalle = errores[clave];
  switch (clave) {
    case 'required':
      return 'Este campo es obligatorio.';
    case 'minlength':
      return `Debe tener al menos ${detalle.requiredLength} caracteres.`;
    case 'maxlength':
      return `Debe tener como máximo ${detalle.requiredLength} caracteres.`;
    case 'min':
      return `El valor mínimo es ${detalle.min}.`;
    case 'max':
      return `El valor máximo es ${detalle.max}.`;
    case 'pattern':
      return 'El formato no es válido.';
    case 'entero':
      return 'Debe ser un número entero.';
    case 'maxDecimales':
      return `Use como máximo ${detalle.max} decimales.`;
    case 'mayorQueCero':
      return 'Debe ser mayor que 0.';
    case 'rangoFechas':
      return 'La fecha inicio no puede ser posterior a la fecha fin.';
    case 'servidor':
      return String(detalle);
    default:
      return typeof detalle === 'string' ? detalle : 'El valor no es válido.';
  }
}
