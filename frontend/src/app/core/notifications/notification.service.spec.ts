import { TestBed } from '@angular/core/testing';
import { DURACION_NOTIFICACION, NotificationService } from './notification.service';

describe('NotificationService', () => {
  let servicio: NotificationService;

  beforeEach(() => {
    jest.useFakeTimers();
    servicio = TestBed.inject(NotificationService);
  });

  afterEach(() => jest.useRealTimers());

  it('agrega notificaciones de cada tipo con ids únicos', () => {
    servicio.exito('Cliente creado');
    servicio.error('Saldo no disponible');
    servicio.info('Procesando');

    const lista = servicio.notificaciones();
    expect(lista.map((n) => [n.tipo, n.mensaje])).toEqual([
      ['exito', 'Cliente creado'],
      ['error', 'Saldo no disponible'],
      ['info', 'Procesando'],
    ]);
    expect(new Set(lista.map((n) => n.id)).size).toBe(3);
  });

  it('cierra una notificación manualmente', () => {
    servicio.exito('Uno');
    servicio.exito('Dos');
    servicio.cerrar(servicio.notificaciones()[0].id);

    expect(servicio.notificaciones().map((n) => n.mensaje)).toEqual(['Dos']);
  });

  it('cierra automáticamente según la duración del tipo', () => {
    servicio.exito('Cliente creado');
    servicio.error('Error');

    jest.advanceTimersByTime(DURACION_NOTIFICACION.exito);
    expect(servicio.notificaciones().map((n) => n.tipo)).toEqual(['error']);

    jest.advanceTimersByTime(DURACION_NOTIFICACION.error - DURACION_NOTIFICACION.exito);
    expect(servicio.notificaciones()).toEqual([]);
  });
});
