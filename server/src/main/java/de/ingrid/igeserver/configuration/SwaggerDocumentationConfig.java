package de.ingrid.igeserver.configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@OpenAPIDefinition(
        info = @io.swagger.v3.oas.annotations.info.Info(
                title = "IGE NG API",
                version = "v1",
                description = "This app provides REST APIs for the IGE NG",
                contact = @io.swagger.v3.oas.annotations.info.Contact(
                        name = "André Wallat",
                        email = "andre.wallat@wemove.com",
                        url = "https://www.wemove.com"
                )
        ),
        servers = {
                @Server(
                        url = "http://localhost:8550",
                        description = "Local Server"
                ),
                @Server(
                        url = "http://ige-ng.informationgrid.eu/",
                        description = "Test Server"
                )
        }
)

@Configuration
public class SwaggerDocumentationConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedMethods(
                        HttpMethod.GET.toString(),
                        HttpMethod.POST.toString(),
                        HttpMethod.PUT.toString(),
                        HttpMethod.DELETE.toString(),
                        HttpMethod.OPTIONS.toString())
                .allowedOrigins("*");
    }

}
