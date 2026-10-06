import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    title: 'Reportes | Banco',
    loadComponent: () => import('./reporte-page/reporte.page').then((m) => m.ReportePage),
  },
];
