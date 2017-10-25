package de.ingrid.igeserver.configuration;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

/**
 * Home redirection to swagger api documentation
 */
@Controller
public class HomeController {

    @GetMapping(value = "/")
    public RedirectView index() {
        return new RedirectView( "swagger-ui.html" );
    }
}
