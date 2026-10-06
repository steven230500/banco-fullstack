package com.banco.api.cliente.application;

import com.banco.api.cliente.application.dto.ClienteCreateRequest;
import com.banco.api.cliente.application.dto.ClientePatchRequest;
import com.banco.api.cliente.application.dto.ClienteResponse;
import com.banco.api.cliente.application.dto.ClienteUpdateRequest;
import com.banco.api.cliente.domain.Cliente;
import com.banco.api.cliente.domain.DatosPersona;
import java.util.Optional;

final class ClienteMapper {

    private ClienteMapper() {
    }

    static ClienteResponse toResponse(Cliente cliente) {
        return new ClienteResponse(
                cliente.getId(),
                cliente.getClienteId(),
                cliente.getNombre(),
                cliente.getGenero(),
                cliente.getEdad(),
                cliente.getIdentificacion(),
                cliente.getDireccion(),
                cliente.getTelefono(),
                cliente.isEstado());
    }

    static DatosPersona datosPersona(ClienteCreateRequest request) {
        return new DatosPersona(request.nombre().strip(), request.genero(), request.edad(),
                request.identificacion(), request.direccion().strip(), request.telefono());
    }

    static DatosPersona datosPersona(ClienteUpdateRequest request) {
        return new DatosPersona(request.nombre().strip(), request.genero(), request.edad(),
                request.identificacion(), request.direccion().strip(), request.telefono());
    }

    static DatosPersona fusionar(DatosPersona actual, ClientePatchRequest patch) {
        return new DatosPersona(
                Optional.ofNullable(patch.nombre()).map(String::strip).orElse(actual.nombre()),
                Optional.ofNullable(patch.genero()).orElse(actual.genero()),
                Optional.ofNullable(patch.edad()).orElse(actual.edad()),
                Optional.ofNullable(patch.identificacion()).orElse(actual.identificacion()),
                Optional.ofNullable(patch.direccion()).map(String::strip).orElse(actual.direccion()),
                Optional.ofNullable(patch.telefono()).orElse(actual.telefono()));
    }
}
