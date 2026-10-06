package com.banco.api.cliente.application.dto;

import com.banco.api.cliente.domain.Genero;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClienteUpdateRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotNull Genero genero,
        @NotNull @Min(0) @Max(120) Integer edad,
        @NotBlank @Pattern(regexp = "^\\d{10,13}$", message = "debe tener entre 10 y 13 dígitos")
        String identificacion,
        @NotBlank @Size(max = 200) String direccion,
        @NotBlank @Pattern(regexp = "^\\d{7,15}$", message = "debe tener entre 7 y 15 dígitos")
        String telefono,
        @Size(min = 4, max = 72) String contrasena,
        @NotNull Boolean estado) {

    @Override
    public String toString() {
        return "ClienteUpdateRequest[nombre=%s]".formatted(nombre);
    }
}
