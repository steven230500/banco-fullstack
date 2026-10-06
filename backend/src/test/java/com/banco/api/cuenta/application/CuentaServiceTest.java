package com.banco.api.cuenta.application;

import static com.banco.api.support.Fixtures.dinero;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.banco.api.cliente.domain.ClienteRepository;
import com.banco.api.cuenta.application.dto.CuentaCreateRequest;
import com.banco.api.cuenta.application.dto.CuentaPatchRequest;
import com.banco.api.cuenta.application.dto.CuentaUpdateRequest;
import com.banco.api.cuenta.domain.Cuenta;
import com.banco.api.cuenta.domain.CuentaRepository;
import com.banco.api.cuenta.domain.TipoCuenta;
import com.banco.api.movimiento.domain.MovimientoRepository;
import com.banco.api.shared.exception.OperacionNoPermitidaException;
import com.banco.api.shared.exception.RecursoDuplicadoException;
import com.banco.api.shared.exception.RecursoNoEncontradoException;
import com.banco.api.support.Fixtures;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CuentaServiceTest {

    @Mock
    private CuentaRepository cuentaRepository;
    @Mock
    private ClienteRepository clienteRepository;
    @Mock
    private MovimientoRepository movimientoRepository;

    private CuentaService service;
    private Cuenta cuenta;

    @BeforeEach
    void setUp() {
        service = new CuentaService(cuentaRepository, clienteRepository, movimientoRepository);
        cuenta = Fixtures.cuenta(Fixtures.cliente("jlema", "Jose Lema"), "478758", "2000");
    }

    @Test
    void crearCuentaAsociaAlCliente() {
        var cliente = Fixtures.cliente("jlema", "Jose Lema");
        when(clienteRepository.findByClienteId("jlema")).thenReturn(Optional.of(cliente));
        when(cuentaRepository.save(any(Cuenta.class))).thenAnswer(inv -> inv.getArgument(0));

        var respuesta = service.crear(new CuentaCreateRequest("585545", TipoCuenta.CORRIENTE,
                new BigDecimal("1000"), true, "jlema"));

        assertThat(respuesta.clienteNombre()).isEqualTo("Jose Lema");
        assertThat(respuesta.saldoDisponible()).isEqualTo(dinero("1000"));
    }

    @Test
    void crearCuentaDuplicadaLanzaConflicto() {
        when(cuentaRepository.existsByNumeroCuenta("478758")).thenReturn(true);

        assertThatThrownBy(() -> service.crear(new CuentaCreateRequest("478758", TipoCuenta.AHORROS,
                BigDecimal.ZERO, true, "jlema"))).isInstanceOf(RecursoDuplicadoException.class);
    }

    @Test
    void crearCuentaParaClienteInexistenteLanza404() {
        when(clienteRepository.findByClienteId("nadie")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.crear(new CuentaCreateRequest("111111", TipoCuenta.AHORROS,
                BigDecimal.ZERO, true, "nadie"))).isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void noSePuedeCambiarSaldoInicialSiHayMovimientos() {
        when(cuentaRepository.findByNumeroCuenta("478758")).thenReturn(Optional.of(cuenta));
        when(movimientoRepository.existsByCuentaId(cuenta.getId())).thenReturn(true);

        assertThatThrownBy(() -> service.actualizar("478758",
                new CuentaUpdateRequest(TipoCuenta.AHORROS, new BigDecimal("5"), true)))
                .isInstanceOf(OperacionNoPermitidaException.class);
    }

    @Test
    void cambiarSaldoInicialSinMovimientosReiniciaSaldoDisponible() {
        when(cuentaRepository.findByNumeroCuenta("478758")).thenReturn(Optional.of(cuenta));
        when(movimientoRepository.existsByCuentaId(cuenta.getId())).thenReturn(false);

        var respuesta = service.actualizar("478758",
                new CuentaUpdateRequest(TipoCuenta.CORRIENTE, new BigDecimal("50"), false));

        assertThat(respuesta.saldoDisponible()).isEqualTo(dinero("50"));
        assertThat(respuesta.tipoCuenta()).isEqualTo(TipoCuenta.CORRIENTE);
        assertThat(respuesta.estado()).isFalse();
    }

    @Test
    void patchCambiaSoloElEstado() {
        when(cuentaRepository.findByNumeroCuenta("478758")).thenReturn(Optional.of(cuenta));

        var respuesta = service.actualizarParcial("478758", new CuentaPatchRequest(null, false));

        assertThat(respuesta.estado()).isFalse();
        assertThat(respuesta.tipoCuenta()).isEqualTo(TipoCuenta.AHORROS);
    }

    @Test
    void eliminarCuentaConMovimientosNoEstaPermitido() {
        when(cuentaRepository.findByNumeroCuenta("478758")).thenReturn(Optional.of(cuenta));
        when(movimientoRepository.existsByCuentaId(cuenta.getId())).thenReturn(true);

        assertThatThrownBy(() -> service.eliminar("478758")).isInstanceOf(OperacionNoPermitidaException.class);
        verify(cuentaRepository, never()).delete(any());
    }

    @Test
    void listarPorClienteUsaElFiltro() {
        when(cuentaRepository.findByClienteClienteIdOrderByNumeroCuentaAsc("jlema")).thenReturn(List.of(cuenta));

        assertThat(service.listar(Optional.of("jlema"))).hasSize(1);
    }
}
