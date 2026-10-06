package com.banco.api.shared.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class OpenApiConfig {

    @Bean
    OpenAPI bancoOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Banco API")
                .version("1.0.0")
                .description("Clientes, cuentas, movimientos y estado de cuenta (JSON / PDF en base64)."));
    }
}
