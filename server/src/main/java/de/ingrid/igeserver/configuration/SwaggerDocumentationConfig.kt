package de.ingrid.igeserver.configuration

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.info.Contact
import io.swagger.v3.oas.annotations.info.Info
import io.swagger.v3.oas.annotations.servers.Server
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.Resource
import org.springframework.http.HttpMethod
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.resource.PathResourceResolver


@OpenAPIDefinition(
    info = Info(
        title = "IGE NG API",
        version = "v1",
        description = "This app provides REST APIs for the IGE NG",
        contact = Contact(name = "André Wallat", email = "andre.wallat@wemove.com", url = "https://www.wemove.com")
    ),
    servers = [
        Server(url = "http://localhost:8550", description = "Local Server"),
        Server(url = "https://ige-ng.informationgrid.eu/", description = "Test Server")
    ]
)
@Configuration
open class SwaggerDocumentationConfig : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**")
            .allowedMethods(
                HttpMethod.GET.toString(),
                HttpMethod.POST.toString(),
                HttpMethod.PUT.toString(),
                HttpMethod.DELETE.toString(),
                HttpMethod.OPTIONS.toString()
            )
            .allowedOrigins("*")
    }

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {

        /*
         * This configuration is needed to map path correctly to angular application
         * Otherwise a reload will lead to a 404 - Not Found error
         */
        val basePath = ""
        // Attention: update resource locations when changing springdoc-openapi-ui
        registry.addResourceHandler("$basePath/swagger-ui/index.html**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/swagger-ui/4.1.3/index.html")
        registry.addResourceHandler("$basePath/swagger-ui/*")
                .addResourceLocations("classpath:/META-INF/resources/webjars/swagger-ui/4.1.3/")
        registry.addResourceHandler("/**/*")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(object : PathResourceResolver() {
                    override fun getResource(resourcePath: String, location: Resource): Resource {
                        val requestedResource = location.createRelative(resourcePath)
                        return if (requestedResource.exists() && requestedResource.isReadable) requestedResource else ClassPathResource("/static/index.html")
                    }
                })
    }
}
