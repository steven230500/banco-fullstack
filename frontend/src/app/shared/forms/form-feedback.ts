import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { ApiError, MENSAJE_ERROR_GENERICO, isApiError } from '@core/http/api-error';
import { NotificationService } from '@core/notifications/notification.service';
import { Observable, finalize } from 'rxjs';
import { aplicarErroresServidor } from './server-errors';

export interface AlertaFormulario {
  mensaje: string;
  detalles: string[];
}

export const MENSAJE_FORMULARIO_INVALIDO = 'Revise los campos marcados en el formulario.';

interface OpcionesGuardado<R> {
  peticion: () => Observable<R>;
  mensajeExito: string;
  alGuardar: (resultado: R) => void;
}

// Usa inject(): instanciar solo en un inicializador de campo del componente.
export class EnvioFormulario {
  private readonly notificaciones = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly guardando = signal(false);
  readonly alerta = signal<AlertaFormulario | null>(null);

  enviar<R>(formulario: FormGroup, opciones: OpcionesGuardado<R>): void {
    formulario.markAllAsTouched();
    if (formulario.invalid) {
      this.alerta.set({ mensaje: MENSAJE_FORMULARIO_INVALIDO, detalles: [] });
      return;
    }
    this.alerta.set(null);
    this.guardando.set(true);
    opciones
      .peticion()
      .pipe(
        finalize(() => this.guardando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado) => {
          this.notificaciones.exito(opciones.mensajeExito);
          opciones.alGuardar(resultado);
        },
        error: (error: unknown) => this.mostrarError(formulario, error),
      });
  }

  mostrarError(formulario: FormGroup | null, error: unknown): void {
    const apiError = isApiError(error) ? error : new ApiError(0, MENSAJE_ERROR_GENERICO);
    if (formulario) {
      aplicarErroresServidor(formulario, apiError);
    }
    this.alerta.set({
      mensaje: apiError.detalle,
      detalles: apiError.errores.map((e) => `${e.campo}: ${e.mensaje}`),
    });
  }
}
