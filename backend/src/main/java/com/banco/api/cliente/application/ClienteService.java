package com.banco.api.cliente.application;

import com.banco.api.cliente.application.dto.ClienteCreateRequest;
import com.banco.api.cliente.application.dto.ClientePatchRequest;
import com.banco.api.cliente.application.dto.ClienteResponse;
import com.banco.api.cliente.application.dto.ClienteUpdateRequest;
import com.banco.api.cliente.domain.Cliente;
import com.banco.api.cliente.domain.ClienteRepository;
import com.banco.api.cliente.domain.DatosPersona;
import com.banco.api.cuenta.domain.CuentaRepository;
import com.banco.api.shared.exception.OperacionNoPermitidaException;
import com.banco.api.shared.exception.RecursoDuplicadoException;
import com.banco.api.shared.exception.RecursoNoEncontradoException;
import java.util.List;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final CuentaRepository cuentaRepository;
    private final PasswordEncoder passwordEncoder;

    public ClienteService(ClienteRepository clienteRepository, CuentaRepository cuentaRepository,
                          PasswordEncoder passwordEncoder) {
        this.clienteRepository = clienteRepository;
        this.cuentaRepository = cuentaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<ClienteResponse> listar() {
        return clienteRepository.findAllByOrderByNombreAsc().stream()
                .map(ClienteMapper::toResponse)
                .toList();
    }

    public ClienteResponse obtener(String clienteId) {
        return ClienteMapper.toResponse(buscar(clienteId));
    }

    @Transactional
    public ClienteResponse crear(ClienteCreateRequest request) {
        if (clienteRepository.existsByClienteId(request.clienteId())) {
            throw new RecursoDuplicadoException("Ya existe un cliente con clienteId '%s'".formatted(request.clienteId()));
        }
        if (clienteRepository.existsByIdentificacion(request.identificacion())) {
            throw identificacionDuplicada(request.identificacion());
        }
        Cliente cliente = Cliente.crear(
                ClienteMapper.datosPersona(request),
                request.clienteId(),
                passwordEncoder.encode(request.contrasena()),
                request.estado());
        return ClienteMapper.toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponse actualizar(String clienteId, ClienteUpdateRequest request) {
        Cliente cliente = buscar(clienteId);
        aplicarCambios(cliente, ClienteMapper.datosPersona(request),
                Optional.ofNullable(request.contrasena()), request.estado());
        return ClienteMapper.toResponse(cliente);
    }

    @Transactional
    public ClienteResponse actualizarParcial(String clienteId, ClientePatchRequest request) {
        Cliente cliente = buscar(clienteId);
        aplicarCambios(cliente, ClienteMapper.fusionar(cliente.datosPersonales(), request),
                Optional.ofNullable(request.contrasena()),
                Optional.ofNullable(request.estado()).orElse(cliente.isEstado()));
        return ClienteMapper.toResponse(cliente);
    }

    @Transactional
    public void eliminar(String clienteId) {
        Cliente cliente = buscar(clienteId);
        if (cuentaRepository.tieneCuentas(cliente.getId())) {
            throw new OperacionNoPermitidaException(
                    "No se puede eliminar el cliente '%s' porque tiene cuentas asociadas".formatted(clienteId));
        }
        clienteRepository.delete(cliente);
    }

    private void aplicarCambios(Cliente cliente, DatosPersona datos, Optional<String> contrasena, boolean estado) {
        if (clienteRepository.existsByIdentificacionAndIdNot(datos.identificacion(), cliente.getId())) {
            throw identificacionDuplicada(datos.identificacion());
        }
        cliente.actualizarDatosPersonales(datos);
        contrasena.map(passwordEncoder::encode).ifPresent(cliente::cambiarContrasena);
        cliente.cambiarEstado(estado);
    }

    private Cliente buscar(String clienteId) {
        return clienteRepository.findByClienteId(clienteId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente", clienteId));
    }

    private static RecursoDuplicadoException identificacionDuplicada(String identificacion) {
        return new RecursoDuplicadoException("Ya existe una persona con identificación '%s'".formatted(identificacion));
    }
}
