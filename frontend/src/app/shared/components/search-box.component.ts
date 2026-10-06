import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

let secuencia = 0;

@Component({
  selector: 'app-search-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-box">
      <label class="sr-only" [for]="id">{{ etiqueta() }}</label>
      <svg class="search-box__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
        <path
          d="M20 20l-3.5-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <input
        [id]="id"
        class="input search-box__input"
        type="search"
        autocomplete="off"
        [placeholder]="etiqueta()"
        [value]="termino()"
        (input)="termino.set($any($event.target).value)"
        data-testid="search-input"
      />
    </div>
  `,
})
export class SearchBoxComponent {
  readonly termino = model('');
  readonly etiqueta = input('Buscar');
  protected readonly id = `busqueda-${++secuencia}`;
}
