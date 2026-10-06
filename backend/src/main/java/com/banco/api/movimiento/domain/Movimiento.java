package com.banco.api.movimiento.domain;

import com.banco.api.cuenta.domain.Cuenta;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "movimiento")
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private Instant fecha;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false, length = 10)
    private TipoMovimiento tipoMovimiento;

    @NotNull
    @Digits(integer = 17, fraction = 2)
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal valor;

    @NotNull
    @PositiveOrZero
    @Digits(integer = 17, fraction = 2)
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal saldo;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cuenta_id", nullable = false, updatable = false)
    private Cuenta cuenta;

    protected Movimiento() {
    }

    private Movimiento(Cuenta cuenta, TipoMovimiento tipoMovimiento, BigDecimal valor, BigDecimal saldo,
                       Instant fecha) {
        this.cuenta = cuenta;
        this.tipoMovimiento = tipoMovimiento;
        this.valor = valor;
        this.saldo = saldo;
        this.fecha = fecha;
    }

    public static Movimiento registrar(Cuenta cuenta, TipoMovimiento tipo, BigDecimal valorConSigno, Instant fecha) {
        BigDecimal saldoResultante = cuenta.aplicar(valorConSigno);
        return new Movimiento(cuenta, tipo, valorConSigno, saldoResultante, fecha);
    }

    public void corregir(TipoMovimiento tipo, BigDecimal valorConSigno) {
        this.tipoMovimiento = tipo;
        this.valor = valorConSigno;
        this.saldo = cuenta.aplicar(valorConSigno);
    }

    public BigDecimal saldoInicial() {
        return saldo.subtract(valor);
    }

    public BigDecimal monto() {
        return valor.abs();
    }

    public Long getId() {
        return id;
    }

    public Instant getFecha() {
        return fecha;
    }

    public TipoMovimiento getTipoMovimiento() {
        return tipoMovimiento;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public Cuenta getCuenta() {
        return cuenta;
    }
}
