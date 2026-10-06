import { Routes } from '@angular/router';

export const CUENTAS_ROUTES: Routes = [
  {
    path: '',
    title: 'Cuentas | Banco',
    loadComponent: () => import('./cuenta-list/cuenta-list.page').then((m) => m.CuentaListPage),
  },
  {
    path: 'nuevo',
    title: 'Nueva cuenta | Banco',
    loadComponent: () => import('./cuenta-form/cuenta-form.page').then((m) => m.CuentaFormPage),
  },
  {
    path: ':numeroCuenta/editar',
    title: 'Editar cuenta | Banco',
    loadComponent: () => import('./cuenta-form/cuenta-form.page').then((m) => m.CuentaFormPage),
  },
];
