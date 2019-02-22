package de.ingrid.igeserver.configuration;

import io.swagger.models.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import javax.servlet.ServletContext;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Configuration
@EnableSwagger2
public class SwaggerDocumentationConfig extends WebMvcConfigurerAdapter {
    
    //@Autowired
    //private SwaggerProperties swaggerProperties;

    ApiInfo apiInfo() {
        return new ApiInfoBuilder()
            .title("IGE remastered API")
            .description("Necessary API to support requests from IGE remastered")
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
    
//    @Bean
//    public HandlerMapping swagger2ControllerProxyMapping(
//        Environment environment,
//        DocumentationCache documentationCache,
//        ServiceModelToSwagger2Mapper mapper,
//        JsonSerializer jsonSerializer) {
//
//        return new Swagger2ControllerRequestMappingHandlerMapping(
//            environment,
//            new Swagger2Controller(environment, documentationCache, mapper, jsonSerializer),
//            swaggerProperties.getBrowsingBasePath());
//    }
//
//    @Bean
//    public HandlerMapping apiResourceControllerProxyMapping(
//        ApiResourceController apiResourceController) {
//
//        return new ProxiedControllerRequestMappingHandlerMapping(
//            apiResourceController,
//            swaggerProperties.getBrowsingBasePath());
//    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String basePath = ""; // swaggerProperties.getBrowsingBasePath();

        registry.
            addResourceHandler(basePath + "/swagger-ui.html**")
            .addResourceLocations("classpath:/META-INF/resources/swagger-ui.html");
        registry.
            addResourceHandler(basePath + "/webjars/**")
            .addResourceLocations("classpath:/META-INF/resources/webjars/");
    }

}
