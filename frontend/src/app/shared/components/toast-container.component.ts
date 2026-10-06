import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '@core/notifications/notification.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" aria-live="polite" aria-atomic="false">
      @for (n of notificaciones(); track n.id) {
        <div
          class="toast"
          [class.toast--exito]="n.tipo === 'exito'"
          [class.toast--error]="n.tipo === 'error'"
          [class.toast--info]="n.tipo === 'info'"
          [attr.role]="n.tipo === 'error' ? 'alert' : 'status'"
          [attr.data-testid]="'toast-' + n.tipo"
        >
          <span class="toast__message">{{ n.mensaje }}</span>
          <button
            type="button"
            class="toast__close"
            aria-label="Cerrar notificación"
            (click)="cerrar(n.id)"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  private readonly servicio = inject(NotificationService);
  readonly notificaciones = this.servicio.notificaciones;

  cerrar(id: number): void {
    this.servicio.cerrar(id);
  }
}
