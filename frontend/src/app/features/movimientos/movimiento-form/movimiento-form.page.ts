import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  Cuenta,
  TIPOS_MOVIMIENTO,
  TIPO_CUENTA_ETIQUETAS,
  TIPO_MOVIMIENTO_ETIQUETAS,
} from '@core/models';
import { AlertComponent } from '@shared/components/alert.component';
import { FieldErrorComponent } from '@shared/components/field-error.component';
import { PageHeaderComponent } from '@shared/components/page-header.component';
import { MonedaPipe } from '@shared/format/format.pipes';
import { EnvioFormulario } from '@shared/forms/form-feedback';
import { CuentasService } from '../../cuentas/data-access/cuentas.service';
import { MovimientosService } from '../data-access/movimientos.service';
import {
  aMovimientoRequest,
  aMovimientoUpdateRequest,
  configurarEdicionMovimiento,
  crearFormularioMovimiento,
} from './movimiento-form.model';

@Component({
  selector: 'app-movimiento-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    FieldErrorComponent,
    AlertComponent,
    MonedaPipe,
  ],
  templateUrl: './movimiento-form.page.html',
})
export class MovimientoFormPage implements OnInit {
  private readonly movimientos = inject(MovimientosService);
  private readonly cuentasService = inject(CuentasService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input<string>();

  protected readonly form = crearFormularioMovimiento(inject(NonNullableFormBuilder));
  protected readonly envio = new EnvioFormulario();
  protected readonly cargando = signal(false);
  protected readonly esEdicion = computed(() => !!this.id());
  protected readonly tipos = TIPOS_MOVIMIENTO;
  protected readonly etiquetasTipo = TIPO_MOVIMIENTO_ETIQUETAS;
  protected readonly etiquetasCuenta = TIPO_CUENTA_ETIQUETAS;

  private readonly cuentas = signal<readonly Cuenta[]>([]);
  // El backend rechaza movimientos sobre cuentas inactivas.
  protected readonly opcionesCuenta = computed(() =>
    this.esEdicion() ? this.cuentas() : this.cuentas().filter((c) => c.estado),
  );

  private readonly numeroSeleccionado = toSignal(this.form.controls.numeroCuenta.valueChanges, {
    initialValue: this.form.controls.numeroCuenta.value,
  });
  protected readonly cuentaSeleccionada = computed(() =>
    this.cuentas().find((c) => c.numeroCuenta === this.numeroSeleccionado()),
  );

  ngOnInit(): void {
    this.cuentasService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cuentas) => this.cuentas.set(cuentas),
        error: (error: unknown) => this.envio.mostrarError(null, error),
      });

    const id = this.id();
    if (id) {
      this.cargando.set(true);
      this.movimientos
        .obtener(Number(id))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (movimiento) => {
            configurarEdicionMovimiento(this.form, movimiento);
            this.cargando.set(false);
          },
          error: (error: unknown) => {
            this.cargando.set(false);
            this.envio.mostrarError(null, error);
          },
        });
    }
  }

  protected invalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.touched && control.invalid;
  }

  protected guardar(): void {
    const id = this.id();
    const valor = this.form.getRawValue();
    this.envio.enviar(this.form, {
      peticion: () =>
        id
          ? this.movimientos.actualizar(Number(id), aMovimientoUpdateRequest(valor))
          : this.movimientos.crear(aMovimientoRequest(valor)),
      mensajeExito: id ? 'Movimiento actualizado' : 'Movimiento registrado',
      alGuardar: () => this.router.navigateByUrl('/movimientos'),
    });
  }
}
