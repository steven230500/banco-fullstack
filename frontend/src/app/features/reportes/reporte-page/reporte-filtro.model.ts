import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ReporteParams } from '@core/models';
import { aFechaIso, inicioDeMes } from '@shared/format/format';
import { rangoFechas } from '@shared/forms/validators';

export function crearFormularioReporte(fb: NonNullableFormBuilder, hoy: Date = new Date()) {
  return fb.group(
    {
      clienteId: fb.control('', Validators.required),
      fechaInicio: fb.control(inicioDeMes(hoy), Validators.required),
      fechaFin: fb.control(aFechaIso(hoy), Validators.required),
    },
    { validators: rangoFechas('fechaInicio', 'fechaFin') },
  );
}

export type FormularioReporte = ReturnType<typeof crearFormularioReporte>;

export function aReporteParams(form: FormularioReporte): ReporteParams {
  return form.getRawValue();
}
