package de.ingrid.igeserver.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.resource.PathResourceResolver;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import javax.servlet.ServletContext;
import java.io.IOException;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Configuration
@EnableSwagger2
public class SwaggerDocumentationConfig extends WebMvcConfigurerAdapter {

    ApiInfo apiInfo() {
        return new ApiInfoBuilder()
            .title("IGE-NG API")
            .description("Necessary API to support requests from IGE-NG")
            .license("")
            .licenseUrl("http://unlicense.org")
            .termsOfServiceUrl("")
            .version("1.0.0")
            .contact(new Contact("André Wallat","https://www.wemove.com", "andre.wallat@wemove.com"))
            .build();
    }
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**");
        /*registry.addMapping("/api/**")
                .allowedMethods(
                        HttpMethod.GET.toString(),
                        HttpMethod.POST.toString(),
                        HttpMethod.PUT.toString(),
                        HttpMethod.DELETE.toString(),
                        HttpMethod.OPTIONS.toString())
                .allowedOrigins("*");*/
    }

    @Bean
    public Docket customImplementation(ServletContext servletContext) {
        return new Docket(DocumentationType.SWAGGER_2)
//                .host( "localhost:8081" )
//                .pathProvider(new RelativePathProvider(servletContext) {
//                    @Override
//                    public String getApplicationBasePath() {
//                        return "/api";
//                    }
//                })
                .directModelSubstitute(org.joda.time.LocalDate.class, java.sql.Date.class)
                .directModelSubstitute(org.joda.time.DateTime.class, java.util.Date.class)
                .apiInfo(apiInfo())
                .pathMapping("");//swaggerProperties.getInvokingBasePath());
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String basePath = ""; // swaggerProperties.getBrowsingBasePath();

        registry.
            addResourceHandler(basePath + "/swagger-ui.html**")
            .addResourceLocations("classpath:/META-INF/resources/swagger-ui.html");
        registry.
            addResourceHandler(basePath + "/webjars/**")
            .addResourceLocations("classpath:/META-INF/resources/webjars/");

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
