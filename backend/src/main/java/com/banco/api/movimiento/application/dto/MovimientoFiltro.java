package com.banco.api.movimiento.application.dto;

import java.time.LocalDate;
import java.util.Optional;

public record MovimientoFiltro(
        Optional<String> numeroCuenta,
        Optional<String> clienteId,
        Optional<LocalDate> fechaInicio,
        Optional<LocalDate> fechaFin) {

    public static MovimientoFiltro vacio() {
        return new MovimientoFiltro(Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty());
    }
}
