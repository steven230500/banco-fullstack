package com.banco.api.cliente.application.dto;

import com.banco.api.cliente.domain.Genero;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClientePatchRequest(
        @Size(min = 1, max = 100) String nombre,
        Genero genero,
        @Min(0) @Max(120) Integer edad,
        @Pattern(regexp = "^\\d{10,13}$", message = "debe tener entre 10 y 13 dígitos") String identificacion,
        @Size(min = 1, max = 200) String direccion,
        @Pattern(regexp = "^\\d{7,15}$", message = "debe tener entre 7 y 15 dígitos") String telefono,
        @Size(min = 4, max = 72) String contrasena,
        Boolean estado) {

    @Override
    public String toString() {
        return "ClientePatchRequest[nombre=%s, estado=%s]".formatted(nombre, estado);
    }
}
