package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.api.ForbiddenException
import de.ingrid.igeserver.services.SettingsService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.view.RedirectView

/**
 * Home redirection to swagger api documentation
 */
@Controller
class HomeController(val settingsService: SettingsService) {

    @GetMapping(value = ["/swagger"])
    fun swagger(): RedirectView {
        return RedirectView("swagger-ui/index.html")
    }

    @GetMapping(value = ["/barrierefreiheit"], produces = [MediaType.TEXT_HTML_VALUE])
    @ResponseBody
    fun accessibility(): String {
        val page = settingsService.getItemAsList<LinkedHashMap<String, String>>("cms").find { it["pageId"] == "accessibility" }
        return page?.get("content") ?: "not configured"
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
