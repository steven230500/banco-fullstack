import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { byTestId, clic, estabilizar } from '@testing/dom';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConfirmDialogComponent],
  template: `
    <app-confirm-dialog
      [abierto]="abierto()"
      titulo="Eliminar cliente"
      mensaje="¿Seguro?"
      [procesando]="procesando()"
      (confirmar)="confirmados = confirmados + 1"
      (cancelar)="cancelados = cancelados + 1"
    />
  `,
})
class HostComponent {
  readonly abierto = signal(false);
  readonly procesando = signal(false);
  confirmados = 0;
  cancelados = 0;
}

describe('ConfirmDialogComponent', () => {
  async function crear(abierto = true) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.abierto.set(abierto);
    await estabilizar(fixture);
    return fixture;
  }

  it('no renderiza nada cerrado', async () => {
    const fixture = await crear(false);
    expect(byTestId(fixture, 'confirm-dialog')).toBeNull();
  });

  it('muestra título y mensaje accesibles, con foco en Cancelar', async () => {
    const fixture = await crear();
    const dialogo = byTestId(fixture, 'confirm-dialog');

    expect(dialogo?.getAttribute('role')).toBe('alertdialog');
    expect(dialogo?.getAttribute('aria-modal')).toBe('true');
    expect(dialogo?.textContent).toContain('Eliminar cliente');
    expect(dialogo?.textContent).toContain('¿Seguro?');
    expect(document.activeElement).toBe(byTestId(fixture, 'btn-cancelar-confirmacion'));
  });

  it('emite confirmar y cancelar (botón, fondo y Escape)', async () => {
    const fixture = await crear();
    const host = fixture.componentInstance;

    clic(byTestId(fixture, 'btn-confirmar'));
    clic(byTestId(fixture, 'btn-cancelar-confirmacion'));
    clic(fixture.nativeElement.querySelector('.modal-backdrop'));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(host.confirmados).toBe(1);
    expect(host.cancelados).toBe(3);
  });

  it('deshabilita botones e ignora Escape mientras procesa', async () => {
    const fixture = await crear();
    fixture.componentInstance.procesando.set(true);
    await estabilizar(fixture);

    const confirmar = byTestId<HTMLButtonElement>(fixture, 'btn-confirmar');
    expect(confirmar?.disabled).toBe(true);
    expect(confirmar?.textContent?.trim()).toBe('Procesando…');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fixture.componentInstance.cancelados).toBe(0);
  });
});
