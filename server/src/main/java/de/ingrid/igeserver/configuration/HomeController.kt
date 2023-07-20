package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.api.ForbiddenException
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.servlet.view.RedirectView

/**
 * Home redirection to swagger api documentation
 */
@Controller
class HomeController {

    @GetMapping(value = ["/swagger"])
    fun swagger(): RedirectView {
        return RedirectView("swagger-ui/index.html")
    }

    @GetMapping(value = ["/accessDenied"])
    fun accessDenied(): ResponseEntity<String> {
        throw ForbiddenException.withUser("")
    }

    @PutMapping(value = ["/accessDenied"])
    fun accessDeniedPut(): ResponseEntity<String> {
        throw ForbiddenException.withUser("")
    }

    @PostMapping(value = ["/accessDenied"])
    fun accessDeniedPost(): ResponseEntity<String> {
        throw ForbiddenException.withUser("")
    }

    @DeleteMapping(value = ["/accessDenied"])
    fun accessDeniedDelete(): ResponseEntity<String> {
        throw ForbiddenException.withUser("")
    }
}
