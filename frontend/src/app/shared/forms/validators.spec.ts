import { FormControl, FormGroup } from '@angular/forms';
import { entero, maxDecimales, mayorQueCero, noVacio, rangoFechas } from './validators';
import { mensajeValidacion } from './validation-messages';

describe('validadores personalizados', () => {
  it('maxDecimales acepta hasta N decimales e ignora vacíos', () => {
    const validador = maxDecimales(2);
    expect(validador(new FormControl(10.25))).toBeNull();
    expect(validador(new FormControl(10))).toBeNull();
    expect(validador(new FormControl(null))).toBeNull();
    expect(validador(new FormControl(10.255))).toEqual({ maxDecimales: { max: 2, actual: 3 } });
  });

  it('entero rechaza números con decimales', () => {
    expect(entero(new FormControl(35))).toBeNull();
    expect(entero(new FormControl(''))).toBeNull();
    expect(entero(new FormControl(35.5))).toEqual({ entero: true });
  });

  it('mayorQueCero rechaza cero y negativos', () => {
    expect(mayorQueCero(new FormControl(0.01))).toBeNull();
    expect(mayorQueCero(new FormControl(null))).toBeNull();
    expect(mayorQueCero(new FormControl(0))).toEqual({ mayorQueCero: true });
    expect(mayorQueCero(new FormControl(-5))).toEqual({ mayorQueCero: true });
  });

  it('noVacio rechaza textos solo con espacios', () => {
    expect(noVacio(new FormControl('   '))).toEqual({ required: true });
    expect(noVacio(new FormControl('Jose'))).toBeNull();
    expect(noVacio(new FormControl(''))).toBeNull();
  });

  it('rangoFechas valida que inicio <= fin', () => {
    const grupo = new FormGroup(
      { desde: new FormControl('2026-10-10'), hasta: new FormControl('2026-10-01') },
      { validators: rangoFechas('desde', 'hasta') },
    );
    expect(grupo.errors).toEqual({ rangoFechas: true });

    grupo.controls.hasta.setValue('2026-10-10');
    expect(grupo.errors).toBeNull();

    grupo.controls.desde.setValue('');
    expect(grupo.errors).toBeNull();
  });
});

describe('mensajeValidacion', () => {
  it.each([
    [{ required: true }, 'Este campo es obligatorio.'],
    [{ minlength: { requiredLength: 4 } }, 'Debe tener al menos 4 caracteres.'],
    [{ maxlength: { requiredLength: 100 } }, 'Debe tener como máximo 100 caracteres.'],
    [{ min: { min: 0 } }, 'El valor mínimo es 0.'],
    [{ max: { max: 120 } }, 'El valor máximo es 120.'],
    [{ pattern: {} }, 'El formato no es válido.'],
    [{ entero: true }, 'Debe ser un número entero.'],
    [{ maxDecimales: { max: 2 } }, 'Use como máximo 2 decimales.'],
    [{ mayorQueCero: true }, 'Debe ser mayor que 0.'],
    [{ rangoFechas: true }, 'La fecha inicio no puede ser posterior a la fecha fin.'],
    [{ servidor: 'ya existe' }, 'ya existe'],
    [{ otro: 'mensaje propio' }, 'mensaje propio'],
    [{ otro: true }, 'El valor no es válido.'],
  ])('traduce %p', (errores, esperado) => {
    expect(mensajeValidacion(errores)).toBe(esperado);
  });

  it('devuelve null sin errores', () => {
    expect(mensajeValidacion(null)).toBeNull();
  });
});
