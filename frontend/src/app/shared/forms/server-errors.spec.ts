import { FormControl, FormGroup } from '@angular/forms';
import { ApiError } from '@core/http/api-error';
import { aplicarErroresServidor } from './server-errors';

describe('aplicarErroresServidor', () => {
  it('asigna los errores a los campos coincidentes y devuelve los no asociados', () => {
    const form = new FormGroup({
      clienteId: new FormControl('jlema'),
      nombre: new FormControl('Jose'),
    });
    const error = new ApiError(400, 'Validación', 'VALIDACION', null, [
      { campo: 'clienteId', mensaje: 'ya existe' },
      { campo: 'desconocido', mensaje: 'no mapea' },
    ]);

    const sinCampo = aplicarErroresServidor(form, error);

    expect(form.controls.clienteId.errors).toEqual({ servidor: 'ya existe' });
    expect(form.controls.clienteId.touched).toBe(true);
    expect(form.controls.nombre.errors).toBeNull();
    expect(sinCampo).toEqual([{ campo: 'desconocido', mensaje: 'no mapea' }]);
  });
});
