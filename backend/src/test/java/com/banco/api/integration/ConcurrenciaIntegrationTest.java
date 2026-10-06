package com.banco.api.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.banco.api.cliente.application.ClienteService;
import com.banco.api.cliente.application.dto.ClienteCreateRequest;
import com.banco.api.cliente.domain.Genero;
import com.banco.api.cuenta.application.CuentaService;
import com.banco.api.cuenta.application.dto.CuentaCreateRequest;
import com.banco.api.cuenta.domain.TipoCuenta;
import com.banco.api.movimiento.application.MovimientoService;
import com.banco.api.movimiento.application.dto.MovimientoRequest;
import com.banco.api.movimiento.domain.TipoMovimiento;
import com.banco.api.shared.exception.ReglaNegocioException;
import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@IntegrationTest
class ConcurrenciaIntegrationTest {

    @Autowired
    private ClienteService clienteService;
    @Autowired
    private CuentaService cuentaService;
    @Autowired
    private MovimientoService movimientoService;

    @Test
    void retirosConcurrentesNoProducenSaldoNegativo() throws Exception {
        clienteService.crear(new ClienteCreateRequest("concurrente", "Cliente Concurrente", Genero.OTRO, 40,
                "1799999999", "Quito", "0999999999", "clave", true));
        cuentaService.crear(new CuentaCreateRequest("900001", TipoCuenta.AHORROS, new BigDecimal("1000"), true,
                "concurrente"));

        var largada = new CountDownLatch(1);
        Callable<Boolean> retiro = () -> {
            largada.await();
            try {
                movimientoService.registrar(new MovimientoRequest("900001", TipoMovimiento.RETIRO,
                        new BigDecimal("200")));
                return true;
            } catch (ReglaNegocioException e) {
                return false;
            }
        };

        try (var executor = Executors.newFixedThreadPool(10)) {
            List<Future<Boolean>> resultados = IntStream.range(0, 10).mapToObj(i -> executor.submit(retiro)).toList();
            largada.countDown();
            long exitosos = 0;
            for (Future<Boolean> resultado : resultados) {
                exitosos += resultado.get() ? 1 : 0;
            }
            assertThat(exitosos).isEqualTo(5);
        }
        assertThat(cuentaService.obtener("900001").saldoDisponible()).isEqualByComparingTo("0");
    }
}
