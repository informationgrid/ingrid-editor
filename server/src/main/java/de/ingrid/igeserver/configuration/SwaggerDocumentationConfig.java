package de.ingrid.igeserver.configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

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
                        url = "https://ige-ng.informationgrid.eu/",
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

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        /*
         * This configuration is needed to map path correctly to angular application
         * Otherwise a reload will lead to a 404 - Not Found error
         */
        String basePath = "";

        registry.
                addResourceHandler(basePath + "/swagger-ui/index.html**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/swagger-ui/3.25.0/index.html");
        registry.
                addResourceHandler(basePath + "/swagger-ui/*")
                .addResourceLocations("classpath:/META-INF/resources/webjars/swagger-ui/3.25.0/");

        registry.addResourceHandler("/**/*")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        return requestedResource.exists() && requestedResource.isReadable() ? requestedResource
                                : new ClassPathResource("/static/index.html");
                    }
                });
    }

}
