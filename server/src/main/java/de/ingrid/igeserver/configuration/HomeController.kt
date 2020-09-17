package de.ingrid.igeserver.configuration

import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.servlet.view.RedirectView
import javax.servlet.http.HttpServletRequest

/**
 * Home redirection to swagger api documentation
 */
@Controller
class HomeController {
    @GetMapping(value = ["/"])
    fun index(): RedirectView {
        return RedirectView("index.html")
    }

    @GetMapping(path = ["/api/logout"])
    fun logout(request: HttpServletRequest): ResponseEntity<String> {
        request.logout()
        return ResponseEntity.ok("""{ "message": "Logged out" }""")
    }

    @GetMapping(value = ["/swagger"])
    fun swagger(): RedirectView {
        return RedirectView("swagger-ui/index.html?configUrl=/v3/api-docs/swagger-config")
    }
}