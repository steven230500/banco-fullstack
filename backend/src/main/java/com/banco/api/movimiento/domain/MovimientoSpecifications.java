package com.banco.api.movimiento.domain;

import java.time.Instant;
import org.springframework.data.jpa.domain.Specification;

public final class MovimientoSpecifications {

    private MovimientoSpecifications() {
    }

    public static Specification<Movimiento> deCuenta(String numeroCuenta) {
        return (root, query, cb) -> cb.equal(root.get("cuenta").get("numeroCuenta"), numeroCuenta);
    }

    public static Specification<Movimiento> deCliente(String clienteId) {
        return (root, query, cb) -> cb.equal(root.get("cuenta").get("cliente").get("clienteId"), clienteId);
    }

    public static Specification<Movimiento> desde(Instant desde) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("fecha"), desde);
    }

    public static Specification<Movimiento> antesDe(Instant hasta) {
        return (root, query, cb) -> cb.lessThan(root.get("fecha"), hasta);
    }
}
