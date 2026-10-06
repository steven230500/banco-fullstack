package com.banco.api.movimiento.application.strategy;

import com.banco.api.movimiento.domain.MovimientoRepository;
import com.banco.api.movimiento.domain.TipoMovimiento;
import com.banco.api.shared.config.BancoProperties;
import com.banco.api.shared.exception.ReglaNegocioException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.stereotype.Component;

@Component
public class RetiroStrategy implements MovimientoStrategy {

    private final MovimientoRepository movimientoRepository;
    private final BigDecimal limiteDiario;
    private final ZoneId zona;

    public RetiroStrategy(MovimientoRepository movimientoRepository, BancoProperties properties) {
        this.movimientoRepository = movimientoRepository;
        this.limiteDiario = properties.movimientos().limiteDiarioRetiro();
        this.zona = properties.zonaHoraria();
    }

    @Override
    public TipoMovimiento tipo() {
        return TipoMovimiento.RETIRO;
    }

    @Override
    public BigDecimal valorConSigno(BigDecimal monto) {
        return monto.abs().negate().setScale(2);
    }

    @Override
    public void validar(ContextoMovimiento contexto) {
        if (!contexto.cuenta().tieneSaldoPara(contexto.monto())) {
            throw ReglaNegocioException.saldoNoDisponible();
        }
        BigDecimal retiradoHoy = retiradoEnElDia(contexto);
        if (retiradoHoy.add(contexto.monto()).compareTo(limiteDiario) > 0) {
            throw ReglaNegocioException.cupoDiarioExcedido();
        }
    }

    private BigDecimal retiradoEnElDia(ContextoMovimiento contexto) {
        LocalDate dia = LocalDate.ofInstant(contexto.fecha(), zona);
        return movimientoRepository.totalPorTipoEntre(
                        contexto.cuenta().getId(),
                        TipoMovimiento.RETIRO,
                        dia.atStartOfDay(zona).toInstant(),
                        dia.plusDays(1).atStartOfDay(zona).toInstant(),
                        contexto.movimientoExcluidoId())
                .abs();
    }
}
