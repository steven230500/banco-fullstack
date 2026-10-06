package com.banco.api.movimiento.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.banco.api.movimiento.application.MovimientoService;
import com.banco.api.movimiento.application.dto.MovimientoResponse;
import com.banco.api.movimiento.domain.TipoMovimiento;
import com.banco.api.shared.config.SecurityConfig;
import com.banco.api.shared.exception.ReglaNegocioException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(MovimientoController.class)
@Import(SecurityConfig.class)
class MovimientoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MovimientoService movimientoService;

    @Test
    void retiroValidoDevuelve201ConValorNegativo() throws Exception {
        when(movimientoService.registrar(any())).thenReturn(new MovimientoResponse(1L,
                OffsetDateTime.parse("2026-10-06T10:00:00-05:00"), "478758", TipoMovimiento.RETIRO,
                new BigDecimal("-575.00"), new BigDecimal("2000.00"), new BigDecimal("1425.00"), "jlema",
                "Jose Lema"));

        mockMvc.perform(post("/api/movimientos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"numeroCuenta\":\"478758\",\"tipoMovimiento\":\"RETIRO\",\"valor\":575}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.valor").value(-575.00))
                .andExpect(jsonPath("$.saldo").value(1425.00));
    }

    @Test
    void saldoNoDisponibleDevuelve422ConMensajeDelEnunciado() throws Exception {
        when(movimientoService.registrar(any())).thenThrow(ReglaNegocioException.saldoNoDisponible());

        mockMvc.perform(post("/api/movimientos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"numeroCuenta\":\"495878\",\"tipoMovimiento\":\"RETIRO\",\"valor\":10}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.detail").value("Saldo no disponible"))
                .andExpect(jsonPath("$.codigo").value("SALDO_NO_DISPONIBLE"));
    }

    @Test
    void cupoDiarioExcedidoDevuelve422ConMensajeDelEnunciado() throws Exception {
        when(movimientoService.registrar(any())).thenThrow(ReglaNegocioException.cupoDiarioExcedido());

        mockMvc.perform(post("/api/movimientos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"numeroCuenta\":\"478758\",\"tipoMovimiento\":\"RETIRO\",\"valor\":999}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.detail").value("Cupo diario Excedido"));
    }

    @Test
    void valorNegativoOConMasDeDosDecimalesEs400() throws Exception {
        mockMvc.perform(post("/api/movimientos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"numeroCuenta\":\"478758\",\"tipoMovimiento\":\"RETIRO\",\"valor\":-5}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores[0].campo").value("valor"));
        mockMvc.perform(patch("/api/movimientos/1").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"valor\":1.234}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void fechaConFormatoInvalidoEs400() throws Exception {
        mockMvc.perform(get("/api/movimientos").param("fechaInicio", "06/10/2026"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SOLICITUD_INVALIDA"));
    }

    @Test
    void rutaInexistenteDevuelve404ConFormatoUniforme() throws Exception {
        mockMvc.perform(get("/api/no-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("RECURSO_NO_ENCONTRADO"));
    }
}
