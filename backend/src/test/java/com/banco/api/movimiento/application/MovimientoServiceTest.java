package com.banco.api.movimiento.application;

import static com.banco.api.support.Fixtures.dinero;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.banco.api.cuenta.domain.Cuenta;
import com.banco.api.cuenta.domain.CuentaRepository;
import com.banco.api.movimiento.application.dto.MovimientoFiltro;
import com.banco.api.movimiento.application.dto.MovimientoPatchRequest;
import com.banco.api.movimiento.application.dto.MovimientoRequest;
import com.banco.api.movimiento.application.dto.MovimientoUpdateRequest;
import com.banco.api.movimiento.application.strategy.DepositoStrategy;
import com.banco.api.movimiento.application.strategy.MovimientoStrategyResolver;
import com.banco.api.movimiento.application.strategy.RetiroStrategy;
import com.banco.api.movimiento.domain.Movimiento;
import com.banco.api.movimiento.domain.MovimientoRepository;
import com.banco.api.movimiento.domain.TipoMovimiento;
import com.banco.api.shared.config.BancoProperties;
import com.banco.api.shared.exception.OperacionNoPermitidaException;
import com.banco.api.shared.exception.RecursoNoEncontradoException;
import com.banco.api.shared.exception.ReglaNegocioException;
import com.banco.api.shared.exception.SolicitudInvalidaException;
import com.banco.api.support.Fixtures;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MovimientoServiceTest {

    private static final ZoneId ZONA = ZoneId.of("America/Guayaquil");
    private static final Instant AHORA = Instant.parse("2026-10-06T15:00:00Z");

    @Mock
    private MovimientoRepository movimientoRepository;
    @Mock
    private CuentaRepository cuentaRepository;

    private MovimientoService service;
    private Cuenta cuenta;

    @BeforeEach
    void setUp() {
        var properties = new BancoProperties(ZONA, new BancoProperties.Movimientos(new BigDecimal("1000")),
                new BancoProperties.Cors(List.of("http://localhost:4200")));
        var resolver = new MovimientoStrategyResolver(
                List.of(new DepositoStrategy(), new RetiroStrategy(movimientoRepository, properties)));
        service = new MovimientoService(movimientoRepository, cuentaRepository, resolver,
                Clock.fixed(AHORA, ZONA), properties);
        cuenta = Fixtures.cuenta(Fixtures.cliente("jlema", "Jose Lema"), "478758", "2000");
    }

    @Test
    void registrarRetiroDescuentaSaldoYGuardaValorNegativo() {
        when(cuentaRepository.findByNumeroCuentaParaActualizar("478758")).thenReturn(Optional.of(cuenta));
        when(movimientoRepository.totalPorTipoEntre(any(), any(), any(), any(), any())).thenReturn(BigDecimal.ZERO);
        when(movimientoRepository.save(any(Movimiento.class))).thenAnswer(inv -> Fixtures.conId(inv.getArgument(0)));

        var respuesta = service.registrar(
                new MovimientoRequest("478758", TipoMovimiento.RETIRO, new BigDecimal("575")));

        assertThat(respuesta.valor()).isEqualTo(dinero("-575"));
        assertThat(respuesta.saldoInicial()).isEqualTo(dinero("2000"));
        assertThat(respuesta.saldo()).isEqualTo(dinero("1425"));
        assertThat(respuesta.fecha().toInstant()).isEqualTo(AHORA);
        assertThat(cuenta.getSaldoDisponible()).isEqualTo(dinero("1425"));
    }

    @Test
    void registrarEnCuentaInexistenteLanza404() {
        when(cuentaRepository.findByNumeroCuentaParaActualizar("000000")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.registrar(
                new MovimientoRequest("000000", TipoMovimiento.DEPOSITO, BigDecimal.TEN)))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void registrarEnCuentaInactivaNoGuarda() {
        cuenta.cambiarEstado(false);
        when(cuentaRepository.findByNumeroCuentaParaActualizar("478758")).thenReturn(Optional.of(cuenta));

        assertThatThrownBy(() -> service.registrar(
                new MovimientoRequest("478758", TipoMovimiento.DEPOSITO, BigDecimal.TEN)))
                .isInstanceOf(ReglaNegocioException.class);
        verify(movimientoRepository, never()).save(any());
    }

    @Test
    void retiroQueSuperaElCupoNoGuarda() {
        when(cuentaRepository.findByNumeroCuentaParaActualizar("478758")).thenReturn(Optional.of(cuenta));
        when(movimientoRepository.totalPorTipoEntre(any(), any(), any(), any(), any()))
                .thenReturn(new BigDecimal("-900"));

        assertThatThrownBy(() -> service.registrar(
                new MovimientoRequest("478758", TipoMovimiento.RETIRO, new BigDecimal("101"))))
                .hasMessage("Cupo diario Excedido");
        verify(movimientoRepository, never()).save(any());
        assertThat(cuenta.getSaldoDisponible()).isEqualTo(dinero("2000"));
    }

    @Test
    void actualizarElUltimoMovimientoRecalculaSaldo() {
        Movimiento ultimo = Fixtures.movimiento(cuenta, TipoMovimiento.DEPOSITO, "100.00", AHORA);
        prepararCorreccion(ultimo, ultimo);

        var respuesta = service.actualizar(ultimo.getId(),
                new MovimientoUpdateRequest(TipoMovimiento.DEPOSITO, new BigDecimal("300")));

        assertThat(respuesta.saldoInicial()).isEqualTo(dinero("2000"));
        assertThat(respuesta.saldo()).isEqualTo(dinero("2300"));
    }

    @Test
    void patchConservaElTipoSiNoSeEnvia() {
        Movimiento ultimo = Fixtures.movimiento(cuenta, TipoMovimiento.DEPOSITO, "100.00", AHORA);
        prepararCorreccion(ultimo, ultimo);

        var respuesta = service.actualizarParcial(ultimo.getId(), new MovimientoPatchRequest(null, new BigDecimal("50")));

        assertThat(respuesta.tipoMovimiento()).isEqualTo(TipoMovimiento.DEPOSITO);
        assertThat(respuesta.valor()).isEqualTo(dinero("50"));
    }

    @Test
    void noSePuedeModificarUnMovimientoQueNoEsElUltimo() {
        Movimiento primero = Fixtures.movimiento(cuenta, TipoMovimiento.DEPOSITO, "100.00", AHORA);
        Movimiento segundo = Fixtures.movimiento(cuenta, TipoMovimiento.DEPOSITO, "50.00", AHORA);
        prepararCorreccion(primero, segundo);

        assertThatThrownBy(() -> service.eliminar(primero.getId()))
                .isInstanceOf(OperacionNoPermitidaException.class)
                .hasMessageContaining("último movimiento");
        verify(movimientoRepository, never()).delete(any(Movimiento.class));
    }

    @Test
    void eliminarElUltimoRevierteElSaldo() {
        Movimiento ultimo = Fixtures.movimiento(cuenta, TipoMovimiento.RETIRO, "-500.00", AHORA);
        prepararCorreccion(ultimo, ultimo);

        service.eliminar(ultimo.getId());

        assertThat(cuenta.getSaldoDisponible()).isEqualTo(dinero("2000"));
        verify(movimientoRepository).delete(ultimo);
    }

    @Test
    void listarConRangoInvertidoEsSolicitudInvalida() {
        var filtro = new MovimientoFiltro(Optional.empty(), Optional.empty(),
                Optional.of(LocalDate.of(2026, 10, 10)), Optional.of(LocalDate.of(2026, 10, 1)));

        assertThatThrownBy(() -> service.listar(filtro)).isInstanceOf(SolicitudInvalidaException.class);
    }

    @Test
    void obtenerMovimientoInexistenteLanza404() {
        when(movimientoRepository.findWithCuentaById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.obtener(5L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    private void prepararCorreccion(Movimiento objetivo, Movimiento ultimoDeLaCuenta) {
        when(movimientoRepository.findById(objetivo.getId())).thenReturn(Optional.of(objetivo));
        when(cuentaRepository.findByIdParaActualizar(cuenta.getId())).thenReturn(Optional.of(cuenta));
        when(movimientoRepository.findFirstByCuentaIdOrderByFechaDescIdDesc(cuenta.getId()))
                .thenReturn(Optional.of(ultimoDeLaCuenta));
    }
}
