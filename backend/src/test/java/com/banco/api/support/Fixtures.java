package com.banco.api.support;

import com.banco.api.cliente.domain.Cliente;
import com.banco.api.cliente.domain.DatosPersona;
import com.banco.api.cliente.domain.Genero;
import com.banco.api.cuenta.domain.Cuenta;
import com.banco.api.cuenta.domain.TipoCuenta;
import com.banco.api.movimiento.domain.Movimiento;
import com.banco.api.movimiento.domain.TipoMovimiento;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.test.util.ReflectionTestUtils;

public final class Fixtures {

    private static final AtomicLong SECUENCIA = new AtomicLong(1);

    private Fixtures() {
    }

    public static DatosPersona datosPersona(String nombre) {
        return new DatosPersona(nombre, Genero.MASCULINO, 35, "1712345678", "Otavalo sn y principal", "098254785");
    }

    public static Cliente cliente(String clienteId, String nombre) {
        Cliente cliente = Cliente.crear(datosPersona(nombre), clienteId, "{hash}", true);
        return conId(cliente);
    }

    public static Cuenta cuenta(Cliente cliente, String numero, String saldoInicial) {
        Cuenta cuenta = Cuenta.abrir(numero, TipoCuenta.AHORROS, new BigDecimal(saldoInicial), true, cliente);
        return conId(cuenta);
    }

    public static Movimiento movimiento(Cuenta cuenta, TipoMovimiento tipo, String valorConSigno, Instant fecha) {
        return conId(Movimiento.registrar(cuenta, tipo, new BigDecimal(valorConSigno), fecha));
    }

    public static <T> T conId(T entidad) {
        ReflectionTestUtils.setField(entidad, "id", SECUENCIA.getAndIncrement());
        return entidad;
    }

    public static BigDecimal dinero(String valor) {
        return new BigDecimal(valor).setScale(2);
    }
}
