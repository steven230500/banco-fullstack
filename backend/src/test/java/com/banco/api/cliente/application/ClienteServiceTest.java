package com.banco.api.cliente.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.banco.api.cliente.application.dto.ClienteCreateRequest;
import com.banco.api.cliente.application.dto.ClientePatchRequest;
import com.banco.api.cliente.domain.Cliente;
import com.banco.api.cliente.domain.ClienteRepository;
import com.banco.api.cliente.domain.Genero;
import com.banco.api.cuenta.domain.CuentaRepository;
import com.banco.api.shared.exception.OperacionNoPermitidaException;
import com.banco.api.shared.exception.RecursoDuplicadoException;
import com.banco.api.shared.exception.RecursoNoEncontradoException;
import com.banco.api.support.Fixtures;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;
    @Mock
    private CuentaRepository cuentaRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    private ClienteService service;

    @BeforeEach
    void setUp() {
        service = new ClienteService(clienteRepository, cuentaRepository, passwordEncoder);
    }

    @Test
    void crearGuardaLaContrasenaCodificadaYNoLaDevuelve() {
        when(passwordEncoder.encode("1234")).thenReturn("$2a$hash");
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(inv -> Fixtures.conId(inv.getArgument(0)));

        var respuesta = service.crear(request("jlema", "1712345678"));

        var captor = ArgumentCaptor.forClass(Cliente.class);
        verify(clienteRepository).save(captor.capture());
        assertThat(captor.getValue().getContrasena()).isEqualTo("$2a$hash");
        assertThat(respuesta.clienteId()).isEqualTo("jlema");
        assertThat(respuesta.nombre()).isEqualTo("Jose Lema");
    }

    @Test
    void crearConClienteIdDuplicadoLanzaConflicto() {
        when(clienteRepository.existsByClienteId("jlema")).thenReturn(true);

        assertThatThrownBy(() -> service.crear(request("jlema", "1712345678")))
                .isInstanceOf(RecursoDuplicadoException.class);
        verify(clienteRepository, never()).save(any());
    }

    @Test
    void crearConIdentificacionDuplicadaLanzaConflicto() {
        when(clienteRepository.existsByIdentificacion("1712345678")).thenReturn(true);

        assertThatThrownBy(() -> service.crear(request("otro", "1712345678")))
                .isInstanceOf(RecursoDuplicadoException.class)
                .hasMessageContaining("identificación");
    }

    @Test
    void patchSoloCambiaLosCamposEnviados() {
        Cliente cliente = Fixtures.cliente("jlema", "Jose Lema");
        when(clienteRepository.findByClienteId("jlema")).thenReturn(Optional.of(cliente));
        when(clienteRepository.existsByIdentificacionAndIdNot(anyString(), anyLong())).thenReturn(false);

        var respuesta = service.actualizarParcial("jlema",
                new ClientePatchRequest(null, null, null, null, "Nueva dirección", null, null, false));

        assertThat(respuesta.direccion()).isEqualTo("Nueva dirección");
        assertThat(respuesta.nombre()).isEqualTo("Jose Lema");
        assertThat(respuesta.estado()).isFalse();
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void eliminarClienteConCuentasNoEstaPermitido() {
        Cliente cliente = Fixtures.cliente("jlema", "Jose Lema");
        when(clienteRepository.findByClienteId("jlema")).thenReturn(Optional.of(cliente));
        when(cuentaRepository.tieneCuentas(cliente.getId())).thenReturn(true);

        assertThatThrownBy(() -> service.eliminar("jlema")).isInstanceOf(OperacionNoPermitidaException.class);
        verify(clienteRepository, never()).delete(any());
    }

    @Test
    void obtenerClienteInexistenteLanza404() {
        when(clienteRepository.findByClienteId("nadie")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.obtener("nadie")).isInstanceOf(RecursoNoEncontradoException.class);
    }

    private static ClienteCreateRequest request(String clienteId, String identificacion) {
        return new ClienteCreateRequest(clienteId, "Jose Lema", Genero.MASCULINO, 35, identificacion,
                "Otavalo sn y principal", "098254785", "1234", true);
    }
}
