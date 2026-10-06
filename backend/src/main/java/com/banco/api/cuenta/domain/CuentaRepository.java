package com.banco.api.cuenta.domain;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CuentaRepository extends JpaRepository<Cuenta, Long> {

    @EntityGraph(attributePaths = "cliente")
    Optional<Cuenta> findByNumeroCuenta(String numeroCuenta);

    // Serializa movimientos concurrentes sobre la misma cuenta (saldo y cupo diario consistentes).
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cuenta c join fetch c.cliente where c.numeroCuenta = :numeroCuenta")
    Optional<Cuenta> findByNumeroCuentaParaActualizar(@Param("numeroCuenta") String numeroCuenta);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cuenta c join fetch c.cliente where c.id = :id")
    Optional<Cuenta> findByIdParaActualizar(@Param("id") Long id);

    @EntityGraph(attributePaths = "cliente")
    List<Cuenta> findAllByOrderByNumeroCuentaAsc();

    @EntityGraph(attributePaths = "cliente")
    List<Cuenta> findByClienteClienteIdOrderByNumeroCuentaAsc(String clienteId);

    @EntityGraph(attributePaths = "cliente")
    List<Cuenta> findByClienteIdOrderByNumeroCuentaAsc(Long clientePersonaId);

    boolean existsByNumeroCuenta(String numeroCuenta);

    @Query("select count(c) > 0 from Cuenta c where c.cliente.id = :clientePersonaId")
    boolean tieneCuentas(@Param("clientePersonaId") Long clientePersonaId);
}
