import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GENEROS, GENERO_ETIQUETAS } from '@core/models';
import { AlertComponent } from '@shared/components/alert.component';
import { FieldErrorComponent } from '@shared/components/field-error.component';
import { PageHeaderComponent } from '@shared/components/page-header.component';
import { EnvioFormulario } from '@shared/forms/form-feedback';
import { ClientesService } from '../data-access/clientes.service';
import {
  aClienteCreateRequest,
  aClienteUpdateRequest,
  configurarEdicionCliente,
  crearFormularioCliente,
} from './cliente-form.model';

@Component({
  selector: 'app-cliente-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeaderComponent,
    FieldErrorComponent,
    AlertComponent,
  ],
  templateUrl: './cliente-form.page.html',
})
export class ClienteFormPage implements OnInit {
  private readonly servicio = inject(ClientesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly clienteId = input<string>();

  protected readonly form = crearFormularioCliente(inject(NonNullableFormBuilder));
  protected readonly envio = new EnvioFormulario();
  protected readonly cargando = signal(false);
  protected readonly generos = GENEROS;
  protected readonly etiquetasGenero = GENERO_ETIQUETAS;

  protected readonly esEdicion = computed(() => !!this.clienteId());

  ngOnInit(): void {
    const clienteId = this.clienteId();
    if (!clienteId) {
      return;
    }
    this.cargando.set(true);
    this.servicio
      .obtener(clienteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cliente) => {
          configurarEdicionCliente(this.form, cliente);
          this.cargando.set(false);
        },
        error: (error: unknown) => {
          this.cargando.set(false);
          this.envio.mostrarError(null, error);
        },
      });
  }

  protected invalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.touched && control.invalid;
  }

  protected guardar(): void {
    const clienteId = this.clienteId();
    const valor = this.form.getRawValue();
    this.envio.enviar(this.form, {
      peticion: () =>
        clienteId
          ? this.servicio.actualizar(clienteId, aClienteUpdateRequest(valor))
          : this.servicio.crear(aClienteCreateRequest(valor)),
      mensajeExito: clienteId ? 'Cliente actualizado' : 'Cliente creado',
      alGuardar: () => this.router.navigateByUrl('/clientes'),
    });
  }
}
