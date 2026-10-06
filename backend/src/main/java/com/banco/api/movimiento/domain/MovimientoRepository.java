package com.banco.api.movimiento.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long>, JpaSpecificationExecutor<Movimiento> {

    // Evita parámetros null en JPQL (PostgreSQL no infiere su tipo); ningún id real es negativo.
    long SIN_EXCLUSION = -1L;

    @Override
    @EntityGraph(attributePaths = {"cuenta", "cuenta.cliente"})
    List<Movimiento> findAll(Specification<Movimiento> spec, Sort sort);

    @EntityGraph(attributePaths = {"cuenta", "cuenta.cliente"})
    Optional<Movimiento> findWithCuentaById(Long id);

    boolean existsByCuentaId(Long cuentaId);

    Optional<Movimiento> findFirstByCuentaIdOrderByFechaDescIdDesc(Long cuentaId);

    @Query("""
            select sum(m.valor) from Movimiento m
            where m.cuenta.id = :cuentaId
              and m.tipoMovimiento = :tipo
              and m.fecha >= :desde and m.fecha < :hasta
              and m.id <> :excluirId
            """)
    BigDecimal sumarValores(@Param("cuentaId") Long cuentaId,
                            @Param("tipo") TipoMovimiento tipo,
                            @Param("desde") Instant desde,
                            @Param("hasta") Instant hasta,
                            @Param("excluirId") Long excluirId);

    default BigDecimal totalPorTipoEntre(Long cuentaId, TipoMovimiento tipo, Instant desde, Instant hasta,
                                         Optional<Long> excluirId) {
        return Optional.ofNullable(sumarValores(cuentaId, tipo, desde, hasta, excluirId.orElse(SIN_EXCLUSION)))
                .orElse(BigDecimal.ZERO);
    }

    @Query("""
            select m from Movimiento m
            join fetch m.cuenta c
            join fetch c.cliente cl
            where cl.id = :clientePersonaId
              and m.fecha >= :desde and m.fecha < :hasta
            order by m.fecha asc, m.id asc
            """)
    List<Movimiento> findDelClienteEntre(@Param("clientePersonaId") Long clientePersonaId,
                                         @Param("desde") Instant desde,
                                         @Param("hasta") Instant hasta);
}
