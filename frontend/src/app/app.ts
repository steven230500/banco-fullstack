import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from '@shared/components/toast-container.component';

interface EnlaceNavegacion {
  ruta: string;
  etiqueta: string;
  testId: string;
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly enlaces: readonly EnlaceNavegacion[] = [
    { ruta: '/clientes', etiqueta: 'Clientes', testId: 'nav-clientes' },
    { ruta: '/cuentas', etiqueta: 'Cuentas', testId: 'nav-cuentas' },
    { ruta: '/movimientos', etiqueta: 'Movimientos', testId: 'nav-movimientos' },
    { ruta: '/reportes', etiqueta: 'Reportes', testId: 'nav-reportes' },
  ];
}
