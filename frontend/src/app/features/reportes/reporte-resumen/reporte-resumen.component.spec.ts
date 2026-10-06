import { TestBed } from '@angular/core/testing';
import { ESTADO_CUENTA } from '@testing/fixtures';
import { allByTestId, byTestId, estabilizar, textOf } from '@testing/dom';
import { ReporteResumenComponent } from './reporte-resumen.component';

describe('ReporteResumenComponent', () => {
  async function crear(reporte = ESTADO_CUENTA) {
    const fixture = TestBed.createComponent(ReporteResumenComponent);
    fixture.componentRef.setInput('reporte', reporte);
    await estabilizar(fixture);
    return fixture;
  }

  it('muestra período, totales y una tarjeta por cuenta', async () => {
    const fixture = await crear();

    expect(textOf(fixture, 'reporte-resumen')).toContain('Del 01/02/2022 al 10/02/2022');
    expect(textOf(fixture, 'total-cuentas')).toBe('2');
    expect(textOf(fixture, 'total-movimientos')).toBe('2');
    const [corriente] = allByTestId(fixture, 'reporte-cuenta');
    expect(corriente.getAttribute('data-row-key')).toBe('225487');
    expect(corriente.textContent).toContain('Corriente');
    expect(corriente.textContent).toContain('$100.00');
    expect(corriente.textContent).toContain('$600.00');
  });

  it('indica cuando el cliente no tiene cuentas', async () => {
    const fixture = await crear({ ...ESTADO_CUENTA, cuentas: [], movimientos: [] });
    expect(byTestId(fixture, 'reporte-sin-cuentas')).not.toBeNull();
  });
});
