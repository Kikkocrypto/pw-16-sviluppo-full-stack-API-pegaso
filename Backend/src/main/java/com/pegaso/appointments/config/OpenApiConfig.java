package com.pegaso.appointments.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Configurazione di swagger per la documentazione delle API
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI appointmentsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Appointments API")
                        .description("API Backend for medical appointments booking system")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("private healthcare")
                                .email("support@privatehealthcare.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")));
    }
}
