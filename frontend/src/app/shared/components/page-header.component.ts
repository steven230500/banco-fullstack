import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header">
      <h1 class="page-header__title" data-testid="page-title">{{ titulo() }}</h1>
      @if (subtitulo()) {
        <p class="page-header__subtitle">{{ subtitulo() }}</p>
      }
    </header>
  `,
})
export class PageHeaderComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string | null>(null);
}
