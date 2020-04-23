package de.ingrid.igeserver.configuration;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.keycloak.adapters.springsecurity.KeycloakConfiguration;
import org.keycloak.adapters.springsecurity.authentication.KeycloakAuthenticationProvider;
import org.keycloak.adapters.springsecurity.config.KeycloakWebSecurityConfigurerAdapter;
import org.keycloak.adapters.springsecurity.filter.KeycloakSecurityContextRequestFilter;
import org.keycloak.adapters.springsecurity.management.HttpSessionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@KeycloakConfiguration
class KeycloakConfig extends KeycloakWebSecurityConfigurerAdapter {

    private static Logger log = LogManager.getLogger(KeycloakConfig.class);

    @Value("#{'${spring.profiles.active:}'.indexOf('dev') != -1}")
    boolean developmentMode;

    @Value("${app.enable-csrf:false}")
    boolean csrfEnabled;

    @Value("${app.enable-cors:false}")
    private boolean corsEnabled;

    @Value("${app.enable-https:false}")
    private boolean httpsEnabled;

    public class RequestResponseLoggingFilter implements Filter {

        @Override
        public void doFilter(
                ServletRequest request,
                ServletResponse response,
                FilterChain chain) throws IOException, ServletException {

            HttpServletRequest req = (HttpServletRequest) request;
            HttpServletResponse res = (HttpServletResponse) response;

            // only react on API-calls
            if (req.getRequestURI().startsWith("/api/")) {
                checkAndModifyResponse(res);
            } else if (req.getRequestURI().equals("/error")) {
                // after setting error of api-request, another filter is ordering a redirect
                // to the /error page. This we must handle explicitly in order to return our
                // wanted return code
                checkAndModifyResponse(res);
            }

            chain.doFilter(request, response);

        }

        private void checkAndModifyResponse(HttpServletResponse res) throws IOException {
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                String msg = "We seem to be logged out. Throwing exception in order to notify frontend correctly";
                log.info(msg);
                res.sendError(HttpServletResponse.SC_UNAUTHORIZED, msg);
            }
        }

    }

    /**
     * Registers the KeycloakAuthenticationProvider with the authentication manager.
     */
    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        // check out: https://www.thomasvitale.com/spring-security-keycloak/
        SimpleAuthorityMapper grantedAuthorityMapper = new SimpleAuthorityMapper();
        grantedAuthorityMapper.setPrefix("ROLE_");

        KeycloakAuthenticationProvider keycloakAuthenticationProvider = keycloakAuthenticationProvider();
        keycloakAuthenticationProvider.setGrantedAuthoritiesMapper(grantedAuthorityMapper);
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
    }

    /**
     * Do allow semicolons in URL, which are matrix-parameters used by Angular
     *
     * @return the modified firewall
     */
    @Bean
    public HttpFirewall allowUrlEncodedSlashHttpFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowUrlEncodedSlash(true);
        firewall.setAllowSemicolon(true);
        return firewall;
    }

    @Bean
    @Override
    @ConditionalOnMissingBean(HttpSessionManager.class)
    protected HttpSessionManager httpSessionManager() {
        return new HttpSessionManager();
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
            http
                    .csrf().disable()
                    .authorizeRequests().anyRequest().permitAll();
        } else {
            if (csrfEnabled) {
                http = http.csrf()
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .and(); // make cookies readable within JS

            } else {
                http = http.csrf().disable();
            }

            if (!corsEnabled) {
                http = http.cors().disable();
            }

            if (!httpsEnabled) {
                http = http.requiresChannel()
                        .anyRequest()
                        .requiresSecure()
                        .and();
            }

            http
                    .addFilterAfter(new RequestResponseLoggingFilter(), KeycloakSecurityContextRequestFilter.class)
                    .authorizeRequests()
                    .anyRequest().authenticated()
                    .and()
                    .anonymous().disable() // force login when keycloak session timeouts because of inactivity
                    .logout()
                    .permitAll();
        }
    }

}
