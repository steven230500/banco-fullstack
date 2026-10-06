import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@core/notifications/notification.service';
import { byTestId, clic, estabilizar } from '@testing/dom';
import { ToastContainerComponent } from './toast-container.component';

describe('ToastContainerComponent', () => {
  it('muestra las notificaciones y permite cerrarlas', async () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);
    const servicio = TestBed.inject(NotificationService);
    servicio.exito('Cliente creado');
    servicio.error('Saldo no disponible');
    await estabilizar(fixture);

    expect(byTestId(fixture, 'toast-exito')?.textContent).toContain('Cliente creado');
    const error = byTestId(fixture, 'toast-error');
    expect(error?.getAttribute('role')).toBe('alert');
    expect(error?.textContent).toContain('Saldo no disponible');

    clic(error?.querySelector('button') ?? null);
    await estabilizar(fixture);
    expect(byTestId(fixture, 'toast-error')).toBeNull();
    expect(servicio.notificaciones()).toHaveLength(1);
  });
});
