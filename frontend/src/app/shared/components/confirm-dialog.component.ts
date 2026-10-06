import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'alEscape()' },
  template: `
    @if (abierto()) {
      <div class="modal-backdrop" (click)="cancelar.emit()" aria-hidden="true"></div>
      <div
        class="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-titulo"
        aria-describedby="confirm-mensaje"
        data-testid="confirm-dialog"
      >
        <h2 id="confirm-titulo" class="modal__title">{{ titulo() }}</h2>
        <p id="confirm-mensaje" class="modal__message">{{ mensaje() }}</p>
        <div class="modal__actions">
          <button
            #botonCancelar
            type="button"
            class="btn btn--secondary"
            [disabled]="procesando()"
            (click)="cancelar.emit()"
            data-testid="btn-cancelar-confirmacion"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn--danger"
            [disabled]="procesando()"
            (click)="confirmar.emit()"
            data-testid="btn-confirmar"
          >
            {{ procesando() ? 'Procesando…' : textoConfirmar() }}
          </button>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly abierto = input(false);
  readonly titulo = input('Confirmar');
  readonly mensaje = input.required<string>();
  readonly textoConfirmar = input('Eliminar');
  readonly procesando = input(false);

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  private readonly botonCancelar = viewChild<ElementRef<HTMLButtonElement>>('botonCancelar');

  constructor() {
    // Foco inicial en "Cancelar" para que un Enter accidental no confirme una acción destructiva.
    afterRenderEffect(() => {
      this.botonCancelar()?.nativeElement.focus();
    });
  }

  protected alEscape(): void {
    if (this.abierto() && !this.procesando()) {
      this.cancelar.emit();
    }
  }
}
