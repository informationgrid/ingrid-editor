package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.api.ForbiddenException
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.*
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

    @GetMapping(value = ["/barrierefreiheit"], produces = [MediaType.TEXT_HTML_VALUE])
    @ResponseBody
    fun accessibility(): String {
        return """
            <html>
            <body><h1>Barrierefreiheit</h1></body>
            </html>
        """.trimIndent()
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
