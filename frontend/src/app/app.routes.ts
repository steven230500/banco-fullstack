import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'clientes' },
  {
    path: 'clientes',
    loadChildren: () =>
      import('./features/clientes/clientes.routes').then((m) => m.CLIENTES_ROUTES),
  },
  {
    path: 'cuentas',
    loadChildren: () => import('./features/cuentas/cuentas.routes').then((m) => m.CUENTAS_ROUTES),
  },
  {
    path: 'movimientos',
    loadChildren: () =>
      import('./features/movimientos/movimientos.routes').then((m) => m.MOVIMIENTOS_ROUTES),
  },
  {
    path: 'reportes',
    loadChildren: () =>
      import('./features/reportes/reportes.routes').then((m) => m.REPORTES_ROUTES),
  },
  { path: '**', redirectTo: 'clientes' },
];
