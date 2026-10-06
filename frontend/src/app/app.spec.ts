import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { allByTestId, byTestId, estabilizar } from '@testing/dom';
import { App } from './app';

describe('App (layout)', () => {
  it('muestra la marca y el menú lateral con las cuatro secciones', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    await estabilizar(fixture);

    expect(byTestId(fixture, 'brand')?.textContent).toContain('BANCO');
    const enlaces = ['nav-clientes', 'nav-cuentas', 'nav-movimientos', 'nav-reportes'].map((id) =>
      byTestId<HTMLAnchorElement>(fixture, id),
    );
    expect(enlaces.map((e) => e?.textContent?.trim())).toEqual([
      'Clientes',
      'Cuentas',
      'Movimientos',
      'Reportes',
    ]);
    expect(enlaces.map((e) => e?.getAttribute('href'))).toEqual([
      '/clientes',
      '/cuentas',
      '/movimientos',
      '/reportes',
    ]);
    expect(allByTestId(fixture, 'topbar')).toHaveLength(1);
    expect(
      fixture.nativeElement.querySelector('nav[aria-label="Navegación principal"]'),
    ).not.toBeNull();
  });
});
