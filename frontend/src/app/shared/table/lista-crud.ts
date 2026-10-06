import { DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mensajeDeError } from '@core/http/api-error';
import { NotificationService } from '@core/notifications/notification.service';
import { Observable, finalize } from 'rxjs';
import { filtrarFilas } from '../search/search-filter';
import { Columna, textosDeColumnas } from './columna';

export interface OpcionesListaCrud<T> {
  columnas: readonly Columna<T>[];
  cargar: () => Observable<T[]>;
  eliminar: (fila: T) => Observable<void>;
  mensajeEliminado: (fila: T) => string;
}

// Usa inject(): instanciar solo en un inicializador de campo del componente.
export class ListaCrud<T> {
  private readonly notificaciones = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly filas = signal<readonly T[]>([]);
  readonly cargando = signal(false);
  readonly errorCarga = signal<string | null>(null);
  readonly termino = signal('');
  readonly porEliminar = signal<T | null>(null);
  readonly eliminando = signal(false);

  readonly filtradas = computed(() =>
    filtrarFilas(this.filas(), this.termino(), textosDeColumnas(this.opciones.columnas)),
  );

  constructor(private readonly opciones: OpcionesListaCrud<T>) {}

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.opciones
      .cargar()
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (filas) => this.filas.set(filas),
        error: (error: unknown) => this.errorCarga.set(mensajeDeError(error)),
      });
  }

  pedirEliminacion(fila: T): void {
    this.porEliminar.set(fila);
  }

  cancelarEliminacion(): void {
    if (!this.eliminando()) {
      this.porEliminar.set(null);
    }
  }

  confirmarEliminacion(): void {
    const fila = this.porEliminar();
    if (!fila) {
      return;
    }
    this.eliminando.set(true);
    this.opciones
      .eliminar(fila)
      .pipe(
        finalize(() => {
          this.eliminando.set(false);
          this.porEliminar.set(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notificaciones.exito(this.opciones.mensajeEliminado(fila));
          this.cargar();
        },
        error: (error: unknown) => this.notificaciones.error(mensajeDeError(error)),
      });
  }
}
