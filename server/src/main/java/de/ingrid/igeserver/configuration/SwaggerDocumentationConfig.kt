/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.configuration

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.info.Contact
import io.swagger.v3.oas.annotations.info.Info
import io.swagger.v3.oas.models.servers.Server as OpenApiServer
import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.security.*
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.Resource
import org.springframework.http.HttpMethod
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.resource.PathResourceResolver
import java.util.*


@OpenAPIDefinition(
    info = Info(
        title = "IGE-NG API",
        version = "v1",
        description = "The IGE-NG provides the following REST-APIs",
        contact = Contact(name = "Wemove", email = "contact@wemove.com", url = "https://www.wemove.com")
    )
)
@Configuration
class SwaggerDocumentationConfig : WebMvcConfigurer {
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
        registry.addResourceHandler("$basePath/swagger-ui.html**")
            .addResourceLocations("classpath:/")
        registry.addResourceHandler("$basePath/swagger-ui*/**")
            .addResourceLocations("classpath:/META-INF/resources/webjars/")
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

    @Bean
    fun openAPI(@Value("\${ADD_SWAGGER_TEST_SERVER:}") serverUrls: List<String>): OpenAPI {

        val serverList = mutableListOf(
            OpenApiServer().url("http://localhost:8550").description("Local Server"),
            OpenApiServer().url("https://ige-ng.informationgrid.eu/").description("Test Server")
        )

        serverUrls.forEach { pair ->
            val parts = pair.split("::")
            if (parts.size == 2) {
                val url = parts[0]
                val description = parts[1]
                serverList.add( OpenApiServer().url(url).description(description) )
            }
        }

        val oauthSchemeName = "Keycloak Token"
        return OpenAPI()
            .components(
                Components()
                    .addSecuritySchemes(
                        oauthSchemeName,
                        SecurityScheme()
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")
                    )
            )
            .addSecurityItem(
                SecurityRequirement()
                    .addList("bearer-jwt", listOf("read", "write"))
                    .addList(oauthSchemeName, Collections.emptyList())
            )
            .servers(serverList)
    }
}
