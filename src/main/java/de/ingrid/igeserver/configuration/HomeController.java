package de.ingrid.igeserver.configuration;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;

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
        return new RedirectView( "index.html" );
    }

    @GetMapping(path = "/logout")
    public String logout(HttpServletRequest request) throws ServletException {
        request.logout();
        return "/";
    }

    @GetMapping(value = "/swagger")
    public RedirectView swagger() {
        return new RedirectView( "swagger-ui.html" );
    }
}
