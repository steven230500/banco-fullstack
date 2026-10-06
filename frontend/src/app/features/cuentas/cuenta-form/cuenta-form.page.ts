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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Cliente, TIPOS_CUENTA, TIPO_CUENTA_ETIQUETAS } from '@core/models';
import { AlertComponent } from '@shared/components/alert.component';
import { FieldErrorComponent } from '@shared/components/field-error.component';
import { PageHeaderComponent } from '@shared/components/page-header.component';
import { EnvioFormulario } from '@shared/forms/form-feedback';
import { ClientesService } from '../../clientes/data-access/clientes.service';
import { CuentasService } from '../data-access/cuentas.service';
import {
  aCuentaCreateRequest,
  aCuentaUpdateRequest,
  configurarEdicionCuenta,
  crearFormularioCuenta,
} from './cuenta-form.model';

@Component({
  selector: 'app-cuenta-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    FieldErrorComponent,
    AlertComponent,
  ],
  templateUrl: './cuenta-form.page.html',
})
export class CuentaFormPage implements OnInit {
  private readonly cuentas = inject(CuentasService);
  private readonly clientes = inject(ClientesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly numeroCuenta = input<string>();

  protected readonly form = crearFormularioCuenta(inject(NonNullableFormBuilder));
  protected readonly envio = new EnvioFormulario();
  protected readonly cargando = signal(false);
  protected readonly esEdicion = computed(() => !!this.numeroCuenta());
  protected readonly tiposCuenta = TIPOS_CUENTA;
  protected readonly etiquetasTipo = TIPO_CUENTA_ETIQUETAS;

  private readonly todosLosClientes = signal<readonly Cliente[]>([]);
  // El backend solo permite crear cuentas para clientes activos.
  protected readonly opcionesCliente = computed(() =>
    this.esEdicion() ? this.todosLosClientes() : this.todosLosClientes().filter((c) => c.estado),
  );

  ngOnInit(): void {
    this.clientes
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (clientes) => this.todosLosClientes.set(clientes),
        error: (error: unknown) => this.envio.mostrarError(null, error),
      });

    const numeroCuenta = this.numeroCuenta();
    if (numeroCuenta) {
      this.cargando.set(true);
      this.cuentas
        .obtener(numeroCuenta)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (cuenta) => {
            configurarEdicionCuenta(this.form, cuenta);
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
    const numeroCuenta = this.numeroCuenta();
    const valor = this.form.getRawValue();
    this.envio.enviar(this.form, {
      peticion: () =>
        numeroCuenta
          ? this.cuentas.actualizar(numeroCuenta, aCuentaUpdateRequest(valor))
          : this.cuentas.crear(aCuentaCreateRequest(valor)),
      mensajeExito: numeroCuenta ? 'Cuenta actualizada' : 'Cuenta creada',
      alGuardar: () => this.router.navigateByUrl('/cuentas'),
    });
  }
}
