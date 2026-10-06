package com.banco.api.cliente.domain;

import com.banco.api.shared.exception.CodigoError;
import com.banco.api.shared.exception.ReglaNegocioException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "cliente")
@PrimaryKeyJoinColumn(name = "persona_id")
public class Cliente extends Persona {

    @NotBlank
    @Pattern(regexp = "^[a-zA-Z0-9._-]{3,20}$")
    @Column(name = "cliente_id", nullable = false, unique = true, length = 20, updatable = false)
    private String clienteId;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String contrasena;

    @Column(nullable = false)
    private boolean estado;

    protected Cliente() {
    }

    private Cliente(DatosPersona datos, String clienteId, String contrasenaHash, boolean estado) {
        super(datos);
        this.clienteId = clienteId;
        this.contrasena = contrasenaHash;
        this.estado = estado;
    }

    public static Cliente crear(DatosPersona datos, String clienteId, String contrasenaHash, boolean estado) {
        return new Cliente(datos, clienteId, contrasenaHash, estado);
    }

    public void cambiarContrasena(String contrasenaHash) {
        this.contrasena = contrasenaHash;
    }

    public void cambiarEstado(boolean estado) {
        this.estado = estado;
    }

    public void verificarActivo() {
        if (!estado) {
            throw new ReglaNegocioException(CodigoError.CLIENTE_INACTIVO,
                    "El cliente '%s' está inactivo".formatted(clienteId));
        }
    }

    public String getClienteId() {
        return clienteId;
    }

    public String getContrasena() {
        return contrasena;
    }

    public boolean isEstado() {
        return estado;
    }
}
