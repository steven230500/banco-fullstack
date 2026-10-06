package com.banco.api.cuenta.application;

import com.banco.api.cliente.domain.Cliente;
import com.banco.api.cliente.domain.ClienteRepository;
import com.banco.api.cuenta.application.dto.CuentaCreateRequest;
import com.banco.api.cuenta.application.dto.CuentaPatchRequest;
import com.banco.api.cuenta.application.dto.CuentaResponse;
import com.banco.api.cuenta.application.dto.CuentaUpdateRequest;
import com.banco.api.cuenta.domain.Cuenta;
import com.banco.api.cuenta.domain.CuentaRepository;
import com.banco.api.movimiento.domain.MovimientoRepository;
import com.banco.api.shared.exception.OperacionNoPermitidaException;
import com.banco.api.shared.exception.RecursoDuplicadoException;
import com.banco.api.shared.exception.RecursoNoEncontradoException;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CuentaService {

    private final CuentaRepository cuentaRepository;
    private final ClienteRepository clienteRepository;
    private final MovimientoRepository movimientoRepository;

    public CuentaService(CuentaRepository cuentaRepository, ClienteRepository clienteRepository,
                         MovimientoRepository movimientoRepository) {
        this.cuentaRepository = cuentaRepository;
        this.clienteRepository = clienteRepository;
        this.movimientoRepository = movimientoRepository;
    }

    public List<CuentaResponse> listar(Optional<String> clienteId) {
        List<Cuenta> cuentas = clienteId
                .map(cuentaRepository::findByClienteClienteIdOrderByNumeroCuentaAsc)
                .orElseGet(cuentaRepository::findAllByOrderByNumeroCuentaAsc);
        return cuentas.stream().map(CuentaMapper::toResponse).toList();
    }

    public CuentaResponse obtener(String numeroCuenta) {
        return CuentaMapper.toResponse(buscar(numeroCuenta));
    }

    @Transactional
    public CuentaResponse crear(CuentaCreateRequest request) {
        if (cuentaRepository.existsByNumeroCuenta(request.numeroCuenta())) {
            throw new RecursoDuplicadoException("Ya existe la cuenta '%s'".formatted(request.numeroCuenta()));
        }
        Cliente cliente = clienteRepository.findByClienteId(request.clienteId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente", request.clienteId()));
        Cuenta cuenta = Cuenta.abrir(request.numeroCuenta(), request.tipoCuenta(), request.saldoInicial(),
                request.estado(), cliente);
        return CuentaMapper.toResponse(cuentaRepository.save(cuenta));
    }

    @Transactional
    public CuentaResponse actualizar(String numeroCuenta, CuentaUpdateRequest request) {
        Cuenta cuenta = buscar(numeroCuenta);
        if (cuenta.getSaldoInicial().compareTo(request.saldoInicial()) != 0) {
            if (movimientoRepository.existsByCuentaId(cuenta.getId())) {
                throw new OperacionNoPermitidaException(
                        "No se puede cambiar el saldo inicial de una cuenta con movimientos");
            }
            cuenta.redefinirSaldoInicial(request.saldoInicial());
        }
        cuenta.cambiarTipo(request.tipoCuenta());
        cuenta.cambiarEstado(request.estado());
        return CuentaMapper.toResponse(cuenta);
    }

    @Transactional
    public CuentaResponse actualizarParcial(String numeroCuenta, CuentaPatchRequest request) {
        Cuenta cuenta = buscar(numeroCuenta);
        Optional.ofNullable(request.tipoCuenta()).ifPresent(cuenta::cambiarTipo);
        Optional.ofNullable(request.estado()).ifPresent(cuenta::cambiarEstado);
        return CuentaMapper.toResponse(cuenta);
    }

    @Transactional
    public void eliminar(String numeroCuenta) {
        Cuenta cuenta = buscar(numeroCuenta);
        if (movimientoRepository.existsByCuentaId(cuenta.getId())) {
            throw new OperacionNoPermitidaException(
                    "No se puede eliminar la cuenta '%s' porque tiene movimientos".formatted(numeroCuenta));
        }
        cuentaRepository.delete(cuenta);
    }

    private Cuenta buscar(String numeroCuenta) {
        return cuentaRepository.findByNumeroCuenta(numeroCuenta)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cuenta", numeroCuenta));
    }
}
