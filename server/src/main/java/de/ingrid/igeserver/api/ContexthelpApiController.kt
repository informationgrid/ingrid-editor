package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.HelpMessage
import de.ingrid.igeserver.services.ContextHelpService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api"])
class ContexthelpApiController(val helpService: ContextHelpService) : ContexthelpApi {

    override fun getContextHelpText(id: String, profile: String, docType: String): ResponseEntity<HelpMessage> {

        val help = helpService.getHelp(profile, docType, id)
        return ResponseEntity.ok(help)

    }

    override fun listContextHelpIds(profile: String, docType: String): ResponseEntity<List<String>> {
        return ResponseEntity.ok(helpService.getHelpIDs(profile, docType))
    }
}