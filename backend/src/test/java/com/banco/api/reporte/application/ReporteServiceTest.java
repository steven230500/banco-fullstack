package com.banco.api.reporte.application;

import static com.banco.api.support.Fixtures.dinero;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.banco.api.cliente.domain.Cliente;
import com.banco.api.cliente.domain.ClienteRepository;
import com.banco.api.cuenta.domain.Cuenta;
import com.banco.api.cuenta.domain.CuentaRepository;
import com.banco.api.movimiento.domain.MovimientoRepository;
import com.banco.api.movimiento.domain.TipoMovimiento;
import com.banco.api.shared.config.BancoProperties;
import com.banco.api.support.Fixtures;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReporteServiceTest {

    private static final ZoneId ZONA = ZoneId.of("America/Guayaquil");
    private static final RangoFechas FEBRERO = new RangoFechas(LocalDate.of(2022, 2, 1), LocalDate.of(2022, 2, 28));

    @Mock
    private ClienteRepository clienteRepository;
    @Mock
    private CuentaRepository cuentaRepository;
    @Mock
    private MovimientoRepository movimientoRepository;

    private ReporteService service;
    private Cliente marianela;
    private Cuenta corriente;
    private Cuenta ahorros;

    @BeforeEach
    void setUp() {
        var properties = new BancoProperties(ZONA, new BancoProperties.Movimientos(new BigDecimal("1000")),
                new BancoProperties.Cors(List.of("http://localhost:4200")));
        ReportePdfGenerator pdfFalso = reporte -> "%PDF-falso".getBytes();
        service = new ReporteService(clienteRepository, cuentaRepository, movimientoRepository, pdfFalso, properties);

        marianela = Fixtures.cliente("mmontalvo", "Marianela Montalvo");
        corriente = Fixtures.cuenta(marianela, "225487", "100");
        ahorros = Fixtures.cuenta(marianela, "496825", "540");
        when(clienteRepository.findByClienteId("mmontalvo")).thenReturn(Optional.of(marianela));
        when(cuentaRepository.findByClienteIdOrderByNumeroCuentaAsc(marianela.getId()))
                .thenReturn(List.of(corriente, ahorros));
    }

    @Test
    void estadoDeCuentaReproduceElCasoDeUsoDelEnunciado() {
        var deposito = Fixtures.movimiento(corriente, TipoMovimiento.DEPOSITO, "600.00",
                Instant.parse("2022-02-10T15:00:00Z"));
        var retiro = Fixtures.movimiento(ahorros, TipoMovimiento.RETIRO, "-540.00",
                Instant.parse("2022-02-08T15:00:00Z"));
        when(movimientoRepository.findDelClienteEntre(eq(marianela.getId()), any(), any()))
                .thenReturn(List.of(retiro, deposito));

        var reporte = service.generar("mmontalvo", FEBRERO);

        assertThat(reporte.cliente()).isEqualTo("Marianela Montalvo");
        assertThat(reporte.totalCreditos()).isEqualTo(dinero("600"));
        assertThat(reporte.totalDebitos()).isEqualTo(dinero("-540"));
        assertThat(reporte.cuentas()).extracting("numeroCuenta", "saldoDisponible", "totalCreditos", "totalDebitos")
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("225487", dinero("700"), dinero("600"), dinero("0")),
                        org.assertj.core.groups.Tuple.tuple("496825", dinero("0"), dinero("0"), dinero("-540")));
        var fila = reporte.movimientos().get(1);
        assertThat(fila.fecha()).isEqualTo(LocalDate.of(2022, 2, 10));
        assertThat(fila.saldoInicial()).isEqualTo(dinero("100"));
        assertThat(fila.movimiento()).isEqualTo(dinero("600"));
        assertThat(fila.saldoDisponible()).isEqualTo(dinero("700"));
    }

    @Test
    void elRangoSeConvierteADiasCompletosEnLaZonaDelBanco() {
        when(movimientoRepository.findDelClienteEntre(marianela.getId(),
                Instant.parse("2022-02-01T05:00:00Z"), Instant.parse("2022-03-01T05:00:00Z")))
                .thenReturn(List.of());

        var reporte = service.generar("mmontalvo", FEBRERO);

        assertThat(reporte.movimientos()).isEmpty();
        assertThat(reporte.totalCreditos()).isEqualTo(dinero("0"));
    }

    @Test
    void pdfSeDevuelveEnBase64ConNombreDescriptivo() {
        when(movimientoRepository.findDelClienteEntre(any(), any(), any())).thenReturn(List.of());

        var pdf = service.generarPdf("mmontalvo", FEBRERO);

        assertThat(pdf.nombreArchivo()).isEqualTo("estado-cuenta-mmontalvo-2022-02-01-2022-02-28.pdf");
        assertThat(pdf.contentType()).isEqualTo("application/pdf");
        assertThat(new String(Base64.getDecoder().decode(pdf.contenidoBase64()))).isEqualTo("%PDF-falso");
    }
}
