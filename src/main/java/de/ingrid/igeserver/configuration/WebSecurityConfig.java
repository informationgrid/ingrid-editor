package de.ingrid.igeserver.configuration;

public class WebSecurityConfig {
    
}

//@Configuration
//@EnableWebMvc
//public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
//
//    private static Logger log = LogManager.getLogger( WebSecurityConfig.class );
//
//    @Value("${development:true}")
//    private boolean developmentMode;
//
//    @Override
//    protected void configure(HttpSecurity http) throws Exception {
//        if (developmentMode) {
//            initDevelopmentMode( http );
//        } else {
//            initProductionMode( http );
//        }
//    }
//
//    private void initProductionMode(HttpSecurity http) throws Exception {
//        // @formatter:off
//        http
//            .csrf()
//                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()) // make cookies readable within JS
//                .and()
//            .authorizeRequests()
//                .anyRequest().authenticated()
//                .and()
////            .formLogin()
////                .loginPage( "/login" )
////                .permitAll()
////                .and()
//            .logout()
//                .permitAll();
//        // @formatter:on
//
//    }
//
//    private void initDevelopmentMode(HttpSecurity http) throws Exception {
//        log.info( "======================================================" );
//        log.info( "================== DEVELOPMENT MODE ==================" );
//        log.info( "======================================================" );
//        // @formatter:off
//        http
//            //.cors().and()
//            .authorizeRequests()
//                .anyRequest()
//                .permitAll()
//                .and();
//            //.csrf()
//            //    .disable();
//                // .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());
//        // @formatter:on
//    }
//
//}
