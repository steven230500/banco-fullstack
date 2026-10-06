package com.banco.api.reporte.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record EstadoCuentaResponse(
        String clienteId,
        String cliente,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        BigDecimal totalCreditos,
        BigDecimal totalDebitos,
        List<ResumenCuentaResponse> cuentas,
        List<MovimientoReporteResponse> movimientos) {
}
