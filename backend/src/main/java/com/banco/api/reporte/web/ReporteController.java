package com.banco.api.reporte.web;

import com.banco.api.reporte.application.RangoFechas;
import com.banco.api.reporte.application.ReporteService;
import com.banco.api.reporte.application.dto.EstadoCuentaResponse;
import com.banco.api.reporte.application.dto.ReportePdfResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Reportes")
@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @Operation(summary = "Estado de cuenta en JSON",
            description = "Rango con fechaInicio/fechaFin (yyyy-MM-dd) o fecha=inicio,fin")
    @GetMapping
    public EstadoCuentaResponse estadoCuenta(
            @RequestParam String clienteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> fechaFin,
            @RequestParam Optional<String> fecha) {
        return reporteService.generar(clienteId, RangoFechas.de(fechaInicio, fechaFin, fecha));
    }

    @Operation(summary = "Estado de cuenta en PDF codificado en base64")
    @GetMapping("/pdf")
    public ReportePdfResponse estadoCuentaPdf(
            @RequestParam String clienteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> fechaFin,
            @RequestParam Optional<String> fecha) {
        return reporteService.generarPdf(clienteId, RangoFechas.de(fechaInicio, fechaFin, fecha));
    }
}
