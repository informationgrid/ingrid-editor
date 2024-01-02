/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
        val content = if (page?.get("content").isNullOrEmpty()) {
            val inputStream = object {}.javaClass.classLoader.getResourceAsStream("content/accessibility.html")
            inputStream?.bufferedReader()?.readText() ?: "FEHLER!!!"
        } else page?.get("content") ?: ""
        return content
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
