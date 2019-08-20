package de.ingrid.igeserver.configuration;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.keycloak.adapters.KeycloakConfigResolver;
import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.keycloak.adapters.springsecurity.KeycloakConfiguration;
import org.keycloak.adapters.springsecurity.authentication.KeycloakAuthenticationProvider;
import org.keycloak.adapters.springsecurity.config.KeycloakWebSecurityConfigurerAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@KeycloakConfiguration
class KeycloakConfig extends KeycloakWebSecurityConfigurerAdapter {

    private static Logger log = LogManager.getLogger(KeycloakConfig.class);

    @Value("#{'${spring.profiles.active:}'.indexOf('dev') != -1}")
    boolean developmentMode;

    /**
     * Registers the KeycloakAuthenticationProvider with the authentication manager.
     */
    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        KeycloakAuthenticationProvider keycloakAuthenticationProvider = keycloakAuthenticationProvider();

        // adding proper authority mapper for prefixing role with "ROLE_"
        keycloakAuthenticationProvider.setGrantedAuthoritiesMapper(new SimpleAuthorityMapper());

        auth.authenticationProvider(keycloakAuthenticationProvider);
    }

    /**
     * Provide a session authentication strategy bean which should be of type
     * RegisterSessionAuthenticationStrategy for public or confidential applications
     * and NullAuthenticatedSessionStrategy for bearer-only applications.
     */
    @Bean
    @Override
    protected SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new RegisterSessionAuthenticationStrategy(new SessionRegistryImpl());
        // return new NullAuthenticatedSessionStrategy();
    }

    /**
     * Use properties in application.properties instead of keycloak.json
     */
    @Bean
    public KeycloakConfigResolver KeycloakConfigResolver() {
        return new KeycloakSpringBootConfigResolver();
    }

    /**
     * Secure appropriate endpoints
     */
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        super.configure(http);

        if (developmentMode) {
            log.info("======================================================");
            log.info("================== DEVELOPMENT MODE ==================");
            log.info("======================================================");
            // @formatter:off
            http.csrf().disable()
                .authorizeRequests().anyRequest().permitAll();
            // @formatter:on
        } else {
            /*http
                // unfortunately we have to disable CSRF, otherwise each POST-request will result in a 403-error
                // because of "Invalid CSRF token found for http://ige-ng.informationgrid.eu/api/..."
                // FIXME: Find out why CSRF is not working
                .csrf().disable()
                .authorizeRequests()
                    .antMatchers("/sso/login*").permitAll()
                    .antMatchers("/*").hasRole("ADMIN")
                    .anyRequest().permitAll();
                //.antMatchers("/persons*").hasRole("user") // only user with role user are allowed to access
                    //.anyRequest().authenticated();
            // @formatter:off*/
            http
                .csrf()
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()) // make cookies readable within
                                                                                    // JS
                    .and().authorizeRequests().anyRequest().authenticated().and()
                    // .formLogin()
                    // .loginPage( "/login" )
                    // .permitAll()
                    // .and()
                    .logout().permitAll();
            // @formatter:on
        }
    }

}
