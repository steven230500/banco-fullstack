package com.banco.api.reporte.web;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.banco.api.reporte.application.RangoFechas;
import com.banco.api.reporte.application.ReporteService;
import com.banco.api.reporte.application.dto.EstadoCuentaResponse;
import com.banco.api.reporte.application.dto.ReportePdfResponse;
import com.banco.api.shared.config.SecurityConfig;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ReporteController.class)
@Import(SecurityConfig.class)
class ReporteControllerTest {

    private static final RangoFechas RANGO = new RangoFechas(LocalDate.of(2022, 2, 1), LocalDate.of(2022, 2, 10));

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReporteService reporteService;

    @Test
    void aceptaElAliasFechaDelEnunciado() throws Exception {
        when(reporteService.generar(eq("mmontalvo"), eq(RANGO))).thenReturn(new EstadoCuentaResponse(
                "mmontalvo", "Marianela Montalvo", RANGO.inicio(), RANGO.fin(), new BigDecimal("600.00"),
                new BigDecimal("-540.00"), List.of(), List.of()));

        mockMvc.perform(get("/api/reportes").param("clienteId", "mmontalvo").param("fecha", "2022-02-01,2022-02-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cliente").value("Marianela Montalvo"))
                .andExpect(jsonPath("$.fechaInicio").value("2022-02-01"))
                .andExpect(jsonPath("$.totalDebitos").value(-540.00));
        verify(reporteService).generar("mmontalvo", RANGO);
    }

    @Test
    void pdfDevuelveBase64() throws Exception {
        when(reporteService.generarPdf("mmontalvo", RANGO))
                .thenReturn(new ReportePdfResponse("estado.pdf", "application/pdf", "JVBERi0="));

        mockMvc.perform(get("/api/reportes/pdf").param("clienteId", "mmontalvo")
                        .param("fechaInicio", "2022-02-01").param("fechaFin", "2022-02-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenidoBase64").value("JVBERi0="));
    }

    @Test
    void rangoInvertidoEs400() throws Exception {
        mockMvc.perform(get("/api/reportes").param("clienteId", "mmontalvo")
                        .param("fechaInicio", "2022-02-10").param("fechaFin", "2022-02-01"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("fechaInicio no puede ser posterior a fechaFin"));
    }

    @Test
    void sinClienteIdEs400() throws Exception {
        mockMvc.perform(get("/api/reportes").param("fecha", "2022-02-01,2022-02-10"))
                .andExpect(status().isBadRequest());
    }
}
