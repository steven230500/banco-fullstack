package com.banco.api.cuenta.domain;

import com.banco.api.cliente.domain.Cliente;
import com.banco.api.shared.exception.CodigoError;
import com.banco.api.shared.exception.OperacionNoPermitidaException;
import com.banco.api.shared.exception.ReglaNegocioException;
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
import jakarta.persistence.Version;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "cuenta")
public class Cuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Pattern(regexp = "^\\d{6,20}$")
    @Column(name = "numero_cuenta", nullable = false, unique = true, length = 20, updatable = false)
    private String numeroCuenta;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cuenta", nullable = false, length = 10)
    private TipoCuenta tipoCuenta;

    @NotNull
    @PositiveOrZero
    @Digits(integer = 17, fraction = 2)
    @Column(name = "saldo_inicial", nullable = false, precision = 19, scale = 2)
    private BigDecimal saldoInicial;

    @NotNull
    @PositiveOrZero
    @Digits(integer = 17, fraction = 2)
    @Column(name = "saldo_disponible", nullable = false, precision = 19, scale = 2)
    private BigDecimal saldoDisponible;

    @Column(nullable = false)
    private boolean estado;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_persona_id", nullable = false)
    private Cliente cliente;

    @Version
    private Long version;

    protected Cuenta() {
    }

    private Cuenta(String numeroCuenta, TipoCuenta tipoCuenta, BigDecimal saldoInicial, boolean estado,
                   Cliente cliente) {
        this.numeroCuenta = numeroCuenta;
        this.tipoCuenta = tipoCuenta;
        this.saldoInicial = escala(saldoInicial);
        this.saldoDisponible = this.saldoInicial;
        this.estado = estado;
        this.cliente = cliente;
    }

    public static Cuenta abrir(String numeroCuenta, TipoCuenta tipoCuenta, BigDecimal saldoInicial, boolean estado,
                               Cliente cliente) {
        cliente.verificarActivo();
        return new Cuenta(numeroCuenta, tipoCuenta, saldoInicial, estado, cliente);
    }

    public BigDecimal aplicar(BigDecimal valorConSigno) {
        BigDecimal nuevoSaldo = saldoDisponible.add(valorConSigno);
        if (nuevoSaldo.signum() < 0) {
            throw ReglaNegocioException.saldoNoDisponible();
        }
        saldoDisponible = escala(nuevoSaldo);
        return saldoDisponible;
    }

    public void revertir(BigDecimal valorConSigno) {
        BigDecimal nuevoSaldo = saldoDisponible.subtract(valorConSigno);
        if (nuevoSaldo.signum() < 0) {
            throw new OperacionNoPermitidaException("Revertir el movimiento dejaría la cuenta con saldo negativo");
        }
        saldoDisponible = escala(nuevoSaldo);
    }

    public boolean tieneSaldoPara(BigDecimal monto) {
        return saldoDisponible.compareTo(monto) >= 0;
    }

    public void verificarOperable() {
        if (!estado) {
            throw new ReglaNegocioException(CodigoError.CUENTA_INACTIVA,
                    "La cuenta '%s' está inactiva".formatted(numeroCuenta));
        }
        cliente.verificarActivo();
    }

    public void cambiarTipo(TipoCuenta tipoCuenta) {
        this.tipoCuenta = tipoCuenta;
    }

    public void cambiarEstado(boolean estado) {
        this.estado = estado;
    }

    public void redefinirSaldoInicial(BigDecimal saldoInicial) {
        this.saldoInicial = escala(saldoInicial);
        this.saldoDisponible = this.saldoInicial;
    }

    private static BigDecimal escala(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.UNNECESSARY);
    }

    public Long getId() {
        return id;
    }

    public String getNumeroCuenta() {
        return numeroCuenta;
    }

    public TipoCuenta getTipoCuenta() {
        return tipoCuenta;
    }

    public BigDecimal getSaldoInicial() {
        return saldoInicial;
    }

    public BigDecimal getSaldoDisponible() {
        return saldoDisponible;
    }

    public boolean isEstado() {
        return estado;
    }

    public Cliente getCliente() {
        return cliente;
    }
}
