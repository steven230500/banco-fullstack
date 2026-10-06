import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { byTestId, escribir, estabilizar } from '@testing/dom';
import { ListToolbarComponent } from './list-toolbar.component';
import { PageHeaderComponent } from './page-header.component';

describe('ListToolbarComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('propaga el término de búsqueda y enlaza el botón Nuevo', async () => {
    const fixture = TestBed.createComponent(ListToolbarComponent);
    fixture.componentRef.setInput('rutaNuevo', '/clientes/nuevo');
    await estabilizar(fixture);

    const input = byTestId<HTMLInputElement>(fixture, 'search-input');
    expect(input?.placeholder).toBe('Buscar');
    expect(fixture.nativeElement.querySelector(`label[for="${input?.id}"]`)?.textContent).toBe(
      'Buscar',
    );

    escribir(input!, 'jose');
    expect(fixture.componentInstance.termino()).toBe('jose');

    const nuevo = byTestId<HTMLAnchorElement>(fixture, 'btn-nuevo');
    expect(nuevo?.textContent?.trim()).toBe('Nuevo');
    expect(nuevo?.getAttribute('href')).toBe('/clientes/nuevo');
  });

  it('oculta el botón Nuevo sin ruta', async () => {
    const fixture = TestBed.createComponent(ListToolbarComponent);
    await estabilizar(fixture);
    expect(byTestId(fixture, 'btn-nuevo')).toBeNull();
  });
});

describe('PageHeaderComponent', () => {
  it('muestra título y subtítulo opcional', async () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentRef.setInput('titulo', 'Clientes');
    await estabilizar(fixture);
    expect(byTestId(fixture, 'page-title')?.textContent).toBe('Clientes');
    expect(fixture.nativeElement.querySelector('.page-header__subtitle')).toBeNull();

    fixture.componentRef.setInput('subtitulo', 'Gestión');
    await estabilizar(fixture);
    expect(fixture.nativeElement.querySelector('.page-header__subtitle').textContent).toContain(
      'Gestión',
    );
  });
});
