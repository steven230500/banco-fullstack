import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'exito' | 'error' | 'info';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
}

export const DURACION_NOTIFICACION: Readonly<Record<TipoNotificacion, number>> = {
  exito: 4000,
  info: 4000,
  error: 8000,
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notificaciones = signal<readonly Notificacion[]>([]);
  private secuencia = 0;

  readonly notificaciones = this._notificaciones.asReadonly();

  exito(mensaje: string): void {
    this.mostrar('exito', mensaje);
  }

  error(mensaje: string): void {
    this.mostrar('error', mensaje);
  }

  info(mensaje: string): void {
    this.mostrar('info', mensaje);
  }

  cerrar(id: number): void {
    this._notificaciones.update((lista) => lista.filter((n) => n.id !== id));
  }

  private mostrar(tipo: TipoNotificacion, mensaje: string): void {
    const id = ++this.secuencia;
    this._notificaciones.update((lista) => [...lista, { id, tipo, mensaje }]);
    setTimeout(() => this.cerrar(id), DURACION_NOTIFICACION[tipo]);
  }
}
