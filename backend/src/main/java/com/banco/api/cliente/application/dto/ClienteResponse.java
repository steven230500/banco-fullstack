package com.banco.api.cliente.application.dto;

import com.banco.api.cliente.domain.Genero;

public record ClienteResponse(
        Long id,
        String clienteId,
        String nombre,
        Genero genero,
        Integer edad,
        String identificacion,
        String direccion,
        String telefono,
        boolean estado) {
}
