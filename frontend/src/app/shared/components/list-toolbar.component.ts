import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchBoxComponent } from './search-box.component';

@Component({
  selector: 'app-list-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchBoxComponent, RouterLink],
  template: `
    <div class="toolbar">
      <app-search-box [(termino)]="termino" />
      @if (rutaNuevo(); as ruta) {
        <a class="btn btn--primary" [routerLink]="ruta" data-testid="btn-nuevo">{{
          etiquetaNuevo()
        }}</a>
      }
    </div>
  `,
})
export class ListToolbarComponent {
  readonly termino = model('');
  readonly rutaNuevo = input<string | null>(null);
  readonly etiquetaNuevo = input('Nuevo');
}
