package com.banco.api.cliente.web;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.endsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.banco.api.cliente.application.ClienteService;
import com.banco.api.cliente.application.dto.ClienteResponse;
import com.banco.api.cliente.domain.Genero;
import com.banco.api.shared.config.SecurityConfig;
import com.banco.api.shared.exception.OperacionNoPermitidaException;
import com.banco.api.shared.exception.RecursoNoEncontradoException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ClienteController.class)
@Import(SecurityConfig.class)
class ClienteControllerTest {

    private static final ClienteResponse JOSE = new ClienteResponse(1L, "jlema", "Jose Lema", Genero.MASCULINO, 35,
            "1712345678", "Otavalo sn y principal", "098254785", true);

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClienteService clienteService;

    @Test
    void postCreaClienteYDevuelve201ConLocationSinContrasena() throws Exception {
        when(clienteService.crear(any())).thenReturn(JOSE);

        mockMvc.perform(post("/api/clientes").contentType(MediaType.APPLICATION_JSON).content("""
                        {"clienteId":"jlema","nombre":"Jose Lema","genero":"MASCULINO","edad":35,
                         "identificacion":"1712345678","direccion":"Otavalo sn y principal",
                         "telefono":"098254785","contrasena":"1234","estado":true}
                        """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", endsWith("/api/clientes/jlema")))
                .andExpect(jsonPath("$.clienteId").value("jlema"))
                .andExpect(jsonPath("$.contrasena").doesNotExist());
    }

    @Test
    void postInvalidoDevuelve400ConErroresPorCampo() throws Exception {
        mockMvc.perform(post("/api/clientes").contentType(MediaType.APPLICATION_JSON).content("""
                        {"clienteId":"x","nombre":"","genero":"MASCULINO","edad":200,"identificacion":"12",
                         "direccion":"Quito","telefono":"abc","contrasena":"1","estado":true}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.codigo").value("VALIDACION"))
                .andExpect(jsonPath("$.errores", hasSize(6)))
                .andExpect(jsonPath("$.errores[*].campo", hasItem("edad")))
                .andExpect(jsonPath("$.errores[*].campo", hasItem("telefono")));
        verifyNoInteractions(clienteService);
    }

    @Test
    void jsonMalFormadoDevuelve400() throws Exception {
        mockMvc.perform(post("/api/clientes").contentType(MediaType.APPLICATION_JSON).content("{\"genero\":\"X\""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SOLICITUD_INVALIDA"));
    }

    @Test
    void getListaClientes() throws Exception {
        when(clienteService.listar()).thenReturn(List.of(JOSE));

        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombre").value("Jose Lema"))
                .andExpect(header().exists("X-Request-Id"));
    }

    @Test
    void getClienteInexistenteDevuelve404() throws Exception {
        when(clienteService.obtener("nadie")).thenThrow(new RecursoNoEncontradoException("Cliente", "nadie"));

        mockMvc.perform(get("/api/clientes/nadie"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("RECURSO_NO_ENCONTRADO"))
                .andExpect(jsonPath("$.detail").value("Cliente 'nadie' no existe"));
    }

    @Test
    void deleteClienteConCuentasDevuelve409() throws Exception {
        doThrow(new OperacionNoPermitidaException("tiene cuentas")).when(clienteService).eliminar("jlema");

        mockMvc.perform(delete("/api/clientes/jlema"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("OPERACION_NO_PERMITIDA"));
    }

    @Test
    void deleteDevuelve204() throws Exception {
        mockMvc.perform(delete("/api/clientes/jlema")).andExpect(status().isNoContent());
    }
}
