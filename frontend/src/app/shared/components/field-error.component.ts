import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map, of, startWith, switchMap } from 'rxjs';
import { mensajeValidacion } from '../forms/validation-messages';

@Component({
  selector: 'app-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (mensaje(); as texto) {
      <p class="field-error" [id]="id()" [attr.data-testid]="'field-error-' + campo()" role="alert">
        {{ texto }}
      </p>
    }
  `,
})
export class FieldErrorComponent {
  readonly control = input.required<AbstractControl | null>();
  readonly campo = input.required<string>();

  readonly id = computed(() => `error-${this.campo()}`);

  // Se escucha control.events porque, con OnPush, este componente no se re-renderiza cuando cambia el control del padre.
  readonly mensaje = toSignal(
    toObservable(this.control).pipe(
      switchMap((control) =>
        control
          ? control.events.pipe(
              startWith(null),
              map(() =>
                control.touched && control.invalid ? mensajeValidacion(control.errors) : null,
              ),
            )
          : of(null),
      ),
    ),
    { initialValue: null },
  );
}
