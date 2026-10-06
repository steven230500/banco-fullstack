package com.banco.api.cliente.domain;

public record DatosPersona(
        String nombre,
        Genero genero,
        Integer edad,
        String identificacion,
        String direccion,
        String telefono) {
}
