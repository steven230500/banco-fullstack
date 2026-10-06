import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { byTestId, estabilizar } from '@testing/dom';
import { FieldErrorComponent } from './field-error.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldErrorComponent],
  template: `<app-field-error [control]="control" campo="nombre" />`,
})
class HostComponent {
  readonly control = new FormControl('', [Validators.required, Validators.maxLength(3)]);
}

describe('FieldErrorComponent', () => {
  it('muestra el mensaje solo después de tocar el control y lo actualiza al cambiar', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    const { control } = fixture.componentInstance;
    await estabilizar(fixture);
    expect(byTestId(fixture, 'field-error-nombre')).toBeNull();

    control.markAsTouched();
    await estabilizar(fixture);
    const error = byTestId(fixture, 'field-error-nombre');
    expect(error?.textContent?.trim()).toBe('Este campo es obligatorio.');
    expect(error?.id).toBe('error-nombre');

    control.setValue('demasiado');
    await estabilizar(fixture);
    expect(byTestId(fixture, 'field-error-nombre')?.textContent?.trim()).toBe(
      'Debe tener como máximo 3 caracteres.',
    );

    control.setValue('Ana');
    await estabilizar(fixture);
    expect(byTestId(fixture, 'field-error-nombre')).toBeNull();
  });

  it('muestra errores asignados por el servidor', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    const { control } = fixture.componentInstance;
    control.setValue('Ana');
    await estabilizar(fixture);

    control.setErrors({ servidor: 'ya existe' });
    control.markAsTouched();
    await estabilizar(fixture);

    expect(byTestId(fixture, 'field-error-nombre')?.textContent?.trim()).toBe('ya existe');
  });
});
