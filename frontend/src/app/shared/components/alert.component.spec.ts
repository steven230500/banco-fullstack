import { TestBed } from '@angular/core/testing';
import { byTestId, clic, estabilizar } from '@testing/dom';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  it('muestra mensaje, detalles y rol según el tipo', async () => {
    const fixture = TestBed.createComponent(AlertComponent);
    fixture.componentRef.setInput('mensaje', 'La solicitud tiene errores');
    fixture.componentRef.setInput('detalles', ['valor: debe ser mayor que 0']);
    await estabilizar(fixture);

    const alerta = byTestId(fixture, 'alert-error');
    expect(alerta?.getAttribute('role')).toBe('alert');
    expect(alerta?.textContent).toContain('La solicitud tiene errores');
    expect(alerta?.querySelectorAll('li')).toHaveLength(1);
    expect(alerta?.querySelector('button')).toBeNull();

    fixture.componentRef.setInput('tipo', 'info');
    await estabilizar(fixture);
    expect(byTestId(fixture, 'alert-info')?.getAttribute('role')).toBe('status');
  });

  it('emite cerrar cuando es cerrable', async () => {
    const fixture = TestBed.createComponent(AlertComponent);
    fixture.componentRef.setInput('mensaje', 'Aviso');
    fixture.componentRef.setInput('cerrable', true);
    const cerrar = jest.fn();
    fixture.componentInstance.cerrar.subscribe(cerrar);
    await estabilizar(fixture);

    clic(byTestId(fixture, 'alert-error')?.querySelector('button') ?? null);
    expect(cerrar).toHaveBeenCalled();
  });
});
