import { Routes } from '@angular/router';

export const MOVIMIENTOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Movimientos | Banco',
    loadComponent: () =>
      import('./movimiento-list/movimiento-list.page').then((m) => m.MovimientoListPage),
  },
  {
    path: 'nuevo',
    title: 'Nuevo movimiento | Banco',
    loadComponent: () =>
      import('./movimiento-form/movimiento-form.page').then((m) => m.MovimientoFormPage),
  },
  {
    path: ':id/editar',
    title: 'Editar movimiento | Banco',
    loadComponent: () =>
      import('./movimiento-form/movimiento-form.page').then((m) => m.MovimientoFormPage),
  },
];
