import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EstadoCuenta, TIPO_CUENTA_ETIQUETAS } from '@core/models';
import { EstadoPipe, FechaPipe, MonedaPipe } from '@shared/format/format.pipes';

@Component({
  selector: 'app-reporte-resumen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MonedaPipe, FechaPipe, EstadoPipe],
  templateUrl: './reporte-resumen.component.html',
})
export class ReporteResumenComponent {
  readonly reporte = input.required<EstadoCuenta>();
  protected readonly etiquetasTipo = TIPO_CUENTA_ETIQUETAS;
}
