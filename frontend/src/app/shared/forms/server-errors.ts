import { FormGroup } from '@angular/forms';
import { ApiError } from '@core/http/api-error';

export function aplicarErroresServidor(
  formulario: FormGroup,
  error: ApiError,
): ApiError['errores'] {
  const sinCampo = error.errores.filter((e) => {
    const control = formulario.get(e.campo);
    if (!control) {
      return true;
    }
    control.setErrors({ ...(control.errors ?? {}), servidor: e.mensaje });
    control.markAsTouched();
    return false;
  });
  return sinCampo;
}
