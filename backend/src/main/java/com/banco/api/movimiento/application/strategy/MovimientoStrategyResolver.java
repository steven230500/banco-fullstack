package com.banco.api.movimiento.application.strategy;

import com.banco.api.movimiento.domain.TipoMovimiento;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class MovimientoStrategyResolver {

    private final Map<TipoMovimiento, MovimientoStrategy> estrategias;

    public MovimientoStrategyResolver(List<MovimientoStrategy> implementaciones) {
        this.estrategias = implementaciones.stream().collect(Collectors.toMap(
                MovimientoStrategy::tipo,
                Function.identity(),
                (a, b) -> {
                    throw new IllegalStateException("Estrategia duplicada para " + a.tipo());
                },
                () -> new EnumMap<>(TipoMovimiento.class)));
        Arrays.stream(TipoMovimiento.values())
                .filter(tipo -> !estrategias.containsKey(tipo))
                .findAny()
                .ifPresent(tipo -> {
                    throw new IllegalStateException("No hay estrategia para " + tipo);
                });
    }

    public MovimientoStrategy resolver(TipoMovimiento tipo) {
        return Optional.ofNullable(estrategias.get(tipo))
                .orElseThrow(() -> new IllegalArgumentException("Tipo de movimiento no soportado: " + tipo));
    }
}
