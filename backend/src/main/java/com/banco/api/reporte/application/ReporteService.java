package com.banco.api.reporte.application;

import com.banco.api.cliente.domain.Cliente;
import com.banco.api.cliente.domain.ClienteRepository;
import com.banco.api.cuenta.domain.Cuenta;
import com.banco.api.cuenta.domain.CuentaRepository;
import com.banco.api.movimiento.domain.Movimiento;
import com.banco.api.movimiento.domain.MovimientoRepository;
import com.banco.api.reporte.application.dto.EstadoCuentaResponse;
import com.banco.api.reporte.application.dto.MovimientoReporteResponse;
import com.banco.api.reporte.application.dto.ReportePdfResponse;
import com.banco.api.reporte.application.dto.ResumenCuentaResponse;
import com.banco.api.shared.config.BancoProperties;
import com.banco.api.shared.exception.RecursoNoEncontradoException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReporteService {

    private static final Predicate<Movimiento> ES_CREDITO = m -> m.getValor().signum() > 0;
    private static final Predicate<Movimiento> ES_DEBITO = m -> m.getValor().signum() < 0;

    private final ClienteRepository clienteRepository;
    private final CuentaRepository cuentaRepository;
    private final MovimientoRepository movimientoRepository;
    private final ReportePdfGenerator pdfGenerator;
    private final ZoneId zona;

    public ReporteService(ClienteRepository clienteRepository, CuentaRepository cuentaRepository,
                          MovimientoRepository movimientoRepository, ReportePdfGenerator pdfGenerator,
                          BancoProperties properties) {
        this.clienteRepository = clienteRepository;
        this.cuentaRepository = cuentaRepository;
        this.movimientoRepository = movimientoRepository;
        this.pdfGenerator = pdfGenerator;
        this.zona = properties.zonaHoraria();
    }

    public EstadoCuentaResponse generar(String clienteId, RangoFechas rango) {
        Cliente cliente = clienteRepository.findByClienteId(clienteId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente", clienteId));

        List<Cuenta> cuentas = cuentaRepository.findByClienteIdOrderByNumeroCuentaAsc(cliente.getId());
        List<Movimiento> movimientos = movimientoRepository.findDelClienteEntre(
                cliente.getId(),
                rango.inicio().atStartOfDay(zona).toInstant(),
                rango.fin().plusDays(1).atStartOfDay(zona).toInstant());

        Map<Long, List<Movimiento>> porCuenta = movimientos.stream()
                .collect(Collectors.groupingBy(m -> m.getCuenta().getId()));

        List<ResumenCuentaResponse> resumen = cuentas.stream()
                .map(cuenta -> resumir(cuenta, porCuenta.getOrDefault(cuenta.getId(), List.of())))
                .toList();

        return new EstadoCuentaResponse(
                cliente.getClienteId(),
                cliente.getNombre(),
                rango.inicio(),
                rango.fin(),
                sumar(movimientos, ES_CREDITO),
                sumar(movimientos, ES_DEBITO),
                resumen,
                movimientos.stream().map(this::aFila).toList());
    }

    public ReportePdfResponse generarPdf(String clienteId, RangoFechas rango) {
        EstadoCuentaResponse reporte = generar(clienteId, rango);
        byte[] pdf = pdfGenerator.generar(reporte);
        String nombre = "estado-cuenta-%s-%s-%s.pdf".formatted(clienteId, rango.inicio(), rango.fin());
        return new ReportePdfResponse(nombre, "application/pdf", Base64.getEncoder().encodeToString(pdf));
    }

    private static ResumenCuentaResponse resumir(Cuenta cuenta, List<Movimiento> movimientos) {
        return new ResumenCuentaResponse(
                cuenta.getNumeroCuenta(),
                cuenta.getTipoCuenta(),
                cuenta.getSaldoInicial(),
                cuenta.getSaldoDisponible(),
                cuenta.isEstado(),
                sumar(movimientos, ES_CREDITO),
                sumar(movimientos, ES_DEBITO));
    }

    private MovimientoReporteResponse aFila(Movimiento movimiento) {
        Cuenta cuenta = movimiento.getCuenta();
        return new MovimientoReporteResponse(
                LocalDate.ofInstant(movimiento.getFecha(), zona),
                cuenta.getCliente().getNombre(),
                cuenta.getNumeroCuenta(),
                cuenta.getTipoCuenta(),
                movimiento.saldoInicial(),
                cuenta.isEstado(),
                movimiento.getValor(),
                movimiento.getSaldo());
    }

    private static BigDecimal sumar(List<Movimiento> movimientos, Predicate<Movimiento> criterio) {
        return movimientos.stream()
                .filter(criterio)
                .map(Movimiento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2);
    }
}
