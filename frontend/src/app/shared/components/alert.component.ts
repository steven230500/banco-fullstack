import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type TipoAlerta = 'error' | 'exito' | 'info';

@Component({
  selector: 'app-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="alert"
      [class]="'alert alert--' + tipo()"
      [attr.role]="tipo() === 'error' ? 'alert' : 'status'"
      [attr.data-testid]="'alert-' + tipo()"
    >
      <div class="alert__body">
        <p class="alert__message">{{ mensaje() }}</p>
        @if (detalles().length > 0) {
          <ul class="alert__details">
            @for (detalle of detalles(); track $index) {
              <li>{{ detalle }}</li>
            }
          </ul>
        }
      </div>
      @if (cerrable()) {
        <button
          type="button"
          class="alert__close"
          aria-label="Cerrar alerta"
          (click)="cerrar.emit()"
        >
          ×
        </button>
      }
    </div>
  `,
})
export class AlertComponent {
  readonly tipo = input<TipoAlerta>('error');
  readonly mensaje = input.required<string>();
  readonly detalles = input<readonly string[]>([]);
  readonly cerrable = input(false);
  readonly cerrar = output<void>();
}
