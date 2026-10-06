package com.banco.api.movimiento.application;

import static com.banco.api.movimiento.domain.MovimientoSpecifications.antesDe;
import static com.banco.api.movimiento.domain.MovimientoSpecifications.deCliente;
import static com.banco.api.movimiento.domain.MovimientoSpecifications.deCuenta;
import static com.banco.api.movimiento.domain.MovimientoSpecifications.desde;

import com.banco.api.cuenta.domain.Cuenta;
import com.banco.api.cuenta.domain.CuentaRepository;
import com.banco.api.movimiento.application.dto.MovimientoFiltro;
import com.banco.api.movimiento.application.dto.MovimientoPatchRequest;
import com.banco.api.movimiento.application.dto.MovimientoRequest;
import com.banco.api.movimiento.application.dto.MovimientoResponse;
import com.banco.api.movimiento.application.dto.MovimientoUpdateRequest;
import com.banco.api.movimiento.application.strategy.ContextoMovimiento;
import com.banco.api.movimiento.application.strategy.MovimientoStrategy;
import com.banco.api.movimiento.application.strategy.MovimientoStrategyResolver;
import com.banco.api.movimiento.domain.Movimiento;
import com.banco.api.movimiento.domain.MovimientoRepository;
import com.banco.api.movimiento.domain.TipoMovimiento;
import com.banco.api.shared.config.BancoProperties;
import com.banco.api.shared.exception.OperacionNoPermitidaException;
import com.banco.api.shared.exception.RecursoNoEncontradoException;
import com.banco.api.shared.exception.SolicitudInvalidaException;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MovimientoService {

    private static final Sort MAS_RECIENTE_PRIMERO = Sort.by(Sort.Order.desc("fecha"), Sort.Order.desc("id"));

    private final MovimientoRepository movimientoRepository;
    private final CuentaRepository cuentaRepository;
    private final MovimientoStrategyResolver estrategias;
    private final Clock clock;
    private final ZoneId zona;

    public MovimientoService(MovimientoRepository movimientoRepository, CuentaRepository cuentaRepository,
                             MovimientoStrategyResolver estrategias, Clock clock, BancoProperties properties) {
        this.movimientoRepository = movimientoRepository;
        this.cuentaRepository = cuentaRepository;
        this.estrategias = estrategias;
        this.clock = clock;
        this.zona = properties.zonaHoraria();
    }

    public List<MovimientoResponse> listar(MovimientoFiltro filtro) {
        if (filtro.fechaInicio().isPresent() && filtro.fechaFin().isPresent()
                && filtro.fechaInicio().get().isAfter(filtro.fechaFin().get())) {
            throw new SolicitudInvalidaException("fechaInicio no puede ser posterior a fechaFin");
        }
        Specification<Movimiento> criterio = Stream.of(
                        filtro.numeroCuenta().map(numero -> deCuenta(numero)),
                        filtro.clienteId().map(clienteId -> deCliente(clienteId)),
                        filtro.fechaInicio().map(fecha -> desde(fecha.atStartOfDay(zona).toInstant())),
                        filtro.fechaFin().map(fecha -> antesDe(fecha.plusDays(1).atStartOfDay(zona).toInstant())))
                .flatMap(Optional::stream)
                .reduce(Specification.unrestricted(), Specification::and);
        return movimientoRepository.findAll(criterio, MAS_RECIENTE_PRIMERO).stream()
                .map(movimiento -> MovimientoMapper.toResponse(movimiento, zona))
                .toList();
    }

    public MovimientoResponse obtener(Long id) {
        return MovimientoMapper.toResponse(buscar(id), zona);
    }

    @Transactional
    public MovimientoResponse registrar(MovimientoRequest request) {
        Cuenta cuenta = cuentaRepository.findByNumeroCuentaParaActualizar(request.numeroCuenta())
                .orElseThrow(() -> new RecursoNoEncontradoException("Cuenta", request.numeroCuenta()));
        cuenta.verificarOperable();

        MovimientoStrategy estrategia = estrategias.resolver(request.tipoMovimiento());
        var fecha = clock.instant();
        estrategia.validar(ContextoMovimiento.nuevo(cuenta, request.valor(), fecha));

        Movimiento movimiento = Movimiento.registrar(cuenta, request.tipoMovimiento(),
                estrategia.valorConSigno(request.valor()), fecha);
        return MovimientoMapper.toResponse(movimientoRepository.save(movimiento), zona);
    }

    @Transactional
    public MovimientoResponse actualizar(Long id, MovimientoUpdateRequest request) {
        return corregir(id, request.tipoMovimiento(), request.valor());
    }

    @Transactional
    public MovimientoResponse actualizarParcial(Long id, MovimientoPatchRequest request) {
        Movimiento actual = buscarSinCuenta(id);
        TipoMovimiento tipo = Optional.ofNullable(request.tipoMovimiento()).orElse(actual.getTipoMovimiento());
        BigDecimal monto = Optional.ofNullable(request.valor()).orElse(actual.monto());
        return corregir(id, tipo, monto);
    }

    @Transactional
    public void eliminar(Long id) {
        Movimiento movimiento = buscarSinCuenta(id);
        Cuenta cuenta = bloquearCuentaDe(movimiento);
        verificarEsUltimo(movimiento, cuenta);
        cuenta.revertir(movimiento.getValor());
        movimientoRepository.delete(movimiento);
    }

    // Solo el último movimiento: cambiar uno intermedio invalidaría el saldo guardado en los posteriores.
    private MovimientoResponse corregir(Long id, TipoMovimiento tipo, BigDecimal monto) {
        Movimiento movimiento = buscarSinCuenta(id);
        Cuenta cuenta = bloquearCuentaDe(movimiento);
        verificarEsUltimo(movimiento, cuenta);
        cuenta.verificarOperable();

        cuenta.revertir(movimiento.getValor());
        MovimientoStrategy estrategia = estrategias.resolver(tipo);
        estrategia.validar(ContextoMovimiento.correccion(cuenta, monto, movimiento.getFecha(), movimiento.getId()));
        movimiento.corregir(tipo, estrategia.valorConSigno(monto));
        return MovimientoMapper.toResponse(movimiento, zona);
    }

    private Cuenta bloquearCuentaDe(Movimiento movimiento) {
        Long cuentaId = movimiento.getCuenta().getId();
        return cuentaRepository.findByIdParaActualizar(cuentaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cuenta", cuentaId));
    }

    private void verificarEsUltimo(Movimiento movimiento, Cuenta cuenta) {
        boolean esUltimo = movimientoRepository.findFirstByCuentaIdOrderByFechaDescIdDesc(cuenta.getId())
                .map(ultimo -> ultimo.getId().equals(movimiento.getId()))
                .orElse(false);
        if (!esUltimo) {
            throw new OperacionNoPermitidaException(
                    "Solo se puede modificar o eliminar el último movimiento de la cuenta '%s'"
                            .formatted(cuenta.getNumeroCuenta()));
        }
    }

    // La cuenta queda como proxy perezoso; su estado se lee recién al bloquearla (FOR UPDATE).
    private Movimiento buscarSinCuenta(Long id) {
        return movimientoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Movimiento", id));
    }

    private Movimiento buscar(Long id) {
        return movimientoRepository.findWithCuentaById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Movimiento", id));
    }
}
