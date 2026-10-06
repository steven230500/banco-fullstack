package com.banco.api.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.banco.api.cliente.domain.ClienteRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@IntegrationTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CasosDeUsoIntegrationTest {

    private static final String HOY = LocalDate.now(ZoneId.of("America/Guayaquil")).toString();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ClienteRepository clienteRepository;

    @Test
    @Order(1)
    void creacionDeClientes() throws Exception {
        crearCliente("jlema", "Jose Lema", "1700000001", "Otavalo sn y principal", "098254785", "1234");
        crearCliente("mmontalvo", "Marianela Montalvo", "1700000002", "Amazonas y NNUU", "097548965", "5678");
        crearCliente("josorio", "Juan Osorio", "1700000003", "13 junio y Equinoccial", "098874587", "1245");

        assertThat(clienteRepository.findByClienteId("jlema").orElseThrow().getContrasena()).startsWith("$2a$");
        json(post("/api/clientes"), """
                {"clienteId":"jlema","nombre":"Otro","genero":"OTRO","edad":30,"identificacion":"1700000009",
                 "direccion":"x","telefono":"0999999999","contrasena":"1234","estado":true}""")
                .andExpect(status().isConflict());
    }

    @Test
    @Order(2)
    void creacionDeCuentas() throws Exception {
        crearCuenta("478758", "AHORROS", "2000", "jlema");
        crearCuenta("225487", "CORRIENTE", "100", "mmontalvo");
        crearCuenta("495878", "AHORROS", "0", "josorio");
        crearCuenta("496825", "AHORROS", "540", "mmontalvo");
        crearCuenta("585545", "CORRIENTE", "1000", "jlema");

        mockMvc.perform(get("/api/cuentas").param("clienteId", "jlema"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @Order(3)
    void movimientosDelEnunciado() throws Exception {
        movimiento("478758", "RETIRO", "575").andExpect(status().isCreated())
                .andExpect(jsonPath("$.valor").value(-575.0))
                .andExpect(jsonPath("$.saldo").value(1425.0));
        movimiento("225487", "DEPOSITO", "600").andExpect(status().isCreated())
                .andExpect(jsonPath("$.saldo").value(700.0));
        movimiento("495878", "DEPOSITO", "150").andExpect(status().isCreated())
                .andExpect(jsonPath("$.saldo").value(150.0));
        movimiento("496825", "RETIRO", "540").andExpect(status().isCreated())
                .andExpect(jsonPath("$.saldo").value(0.0));
    }

    @Test
    @Order(4)
    void retiroSinSaldoDevuelveSaldoNoDisponible() throws Exception {
        movimiento("496825", "RETIRO", "1")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.detail").value("Saldo no disponible"));
    }

    @Test
    @Order(5)
    void retiroSobreElCupoDiarioDevuelveCupoDiarioExcedido() throws Exception {
        // Ya se retiraron 575 hoy: 575 + 426 > 1000.
        movimiento("478758", "RETIRO", "426")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.detail").value("Cupo diario Excedido"));
        movimiento("478758", "RETIRO", "425").andExpect(status().isCreated());
        movimiento("478758", "RETIRO", "0.01")
                .andExpect(jsonPath("$.detail").value("Cupo diario Excedido"));
    }

    @Test
    @Order(6)
    void reporteDeEstadoDeCuentaPorRangoDeFechas() throws Exception {
        mockMvc.perform(get("/api/reportes").param("clienteId", "mmontalvo").param("fecha", HOY + "," + HOY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cliente").value("Marianela Montalvo"))
                .andExpect(jsonPath("$.totalCreditos").value(600.0))
                .andExpect(jsonPath("$.totalDebitos").value(-540.0))
                .andExpect(jsonPath("$.cuentas", hasSize(2)))
                .andExpect(jsonPath("$.cuentas[0].numeroCuenta").value("225487"))
                .andExpect(jsonPath("$.cuentas[0].saldoDisponible").value(700.0))
                .andExpect(jsonPath("$.movimientos", hasSize(2)))
                .andExpect(jsonPath("$.movimientos[0].saldoInicial").value(100.0))
                .andExpect(jsonPath("$.movimientos[0].movimiento").value(600.0))
                .andExpect(jsonPath("$.movimientos[0].saldoDisponible").value(700.0));

        mockMvc.perform(get("/api/reportes/pdf").param("clienteId", "mmontalvo")
                        .param("fechaInicio", HOY).param("fechaFin", HOY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenidoBase64", startsWith("JVBER")));
    }

    @Test
    @Order(7)
    void soloElUltimoMovimientoSePuedeCorregirOEliminar() throws Exception {
        String primero = idDe(movimiento("585545", "DEPOSITO", "100"));
        String ultimo = idDe(movimiento("585545", "DEPOSITO", "50"));

        json(put("/api/movimientos/" + primero), "{\"tipoMovimiento\":\"DEPOSITO\",\"valor\":10}")
                .andExpect(status().isConflict());
        json(put("/api/movimientos/" + ultimo), "{\"tipoMovimiento\":\"RETIRO\",\"valor\":20}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saldo").value(1080.0));
        mockMvc.perform(delete("/api/movimientos/" + ultimo)).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/cuentas/585545")).andExpect(jsonPath("$.saldoDisponible").value(1100.0));
    }

    @Test
    @Order(8)
    void reglasDeIntegridadReferencial() throws Exception {
        mockMvc.perform(delete("/api/clientes/jlema")).andExpect(status().isConflict());
        mockMvc.perform(delete("/api/cuentas/478758")).andExpect(status().isConflict());

        crearCliente("temporal", "Cliente Temporal", "1700000004", "Quito", "022222222", "abcd");
        mockMvc.perform(delete("/api/clientes/temporal")).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/clientes/temporal")).andExpect(status().isNotFound());
    }

    private void crearCliente(String clienteId, String nombre, String identificacion, String direccion,
                              String telefono, String contrasena) throws Exception {
        json(post("/api/clientes"), """
                {"clienteId":"%s","nombre":"%s","genero":"OTRO","edad":30,"identificacion":"%s",
                 "direccion":"%s","telefono":"%s","contrasena":"%s","estado":true}"""
                .formatted(clienteId, nombre, identificacion, direccion, telefono, contrasena))
                .andExpect(status().isCreated());
    }

    private void crearCuenta(String numero, String tipo, String saldo, String clienteId) throws Exception {
        json(post("/api/cuentas"), """
                {"numeroCuenta":"%s","tipoCuenta":"%s","saldoInicial":%s,"estado":true,"clienteId":"%s"}"""
                .formatted(numero, tipo, saldo, clienteId))
                .andExpect(status().isCreated());
    }

    private ResultActions movimiento(String cuenta, String tipo, String valor) throws Exception {
        return json(post("/api/movimientos"), """
                {"numeroCuenta":"%s","tipoMovimiento":"%s","valor":%s}""".formatted(cuenta, tipo, valor));
    }

    private ResultActions json(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request,
                               String body) throws Exception {
        return mockMvc.perform(request.contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private static String idDe(ResultActions resultado) throws Exception {
        String body = resultado.andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return body.replaceAll(".*\"id\":(\\d+).*", "$1");
    }
}
