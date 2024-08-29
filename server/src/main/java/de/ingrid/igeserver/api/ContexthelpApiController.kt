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
