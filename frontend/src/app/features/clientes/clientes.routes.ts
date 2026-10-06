import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    title: 'Clientes | Banco',
    loadComponent: () => import('./cliente-list/cliente-list.page').then((m) => m.ClienteListPage),
  },
  {
    path: 'nuevo',
    title: 'Nuevo cliente | Banco',
    loadComponent: () => import('./cliente-form/cliente-form.page').then((m) => m.ClienteFormPage),
  },
  {
    path: ':clienteId/editar',
    title: 'Editar cliente | Banco',
    loadComponent: () => import('./cliente-form/cliente-form.page').then((m) => m.ClienteFormPage),
  },
];
