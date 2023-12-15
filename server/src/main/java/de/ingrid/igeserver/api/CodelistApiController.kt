/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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

import de.ingrid.codelists.model.CodeList
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping("/api/codelist")
class CodelistApiController : CodelistApi {

    @Autowired
    private lateinit var handler: CodelistHandler

    @Autowired
    private lateinit var catalogService: CatalogService

    override fun getCodelistsByIds(principal: Principal, ids: List<String>): ResponseEntity<List<CodeList>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val codelists = handler.getCodelists(ids)

        val catalogCodelists = handler.getCatalogCodelists(catalogId)
            .filter { ids.contains(it.id) }

        return ResponseEntity.ok(codelists + catalogCodelists)
    }

    override fun getCatalogCodelists(principal: Principal): ResponseEntity<List<CodeList>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val findAll = handler.getCatalogCodelists(catalogId)

        return ResponseEntity.ok(findAll)
    }

    override fun updateCatalogCodelist(
        principal: Principal,
        id: String,
        codelist: Codelist
    ): ResponseEntity<Codelist> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val response = handler.updateCodelist(catalogId, id, codelist)
        return ResponseEntity.ok(response)
    }

    @Transactional
    override fun resetCatalogCodelist(principal: Principal, id: String?): ResponseEntity<List<CodeList>> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val catalog = catalogService.getCatalogById(catalogId)
        
        val ident = if (id == "null") null else id
        catalogService.initializeCodelists(catalogId, catalog.type, ident)
        
        val response = if (ident == null) {
            handler.getCatalogCodelists(catalogId)
        } else {
            listOfNotNull(
                handler.getCatalogCodelists(catalogId).find { it.id == id }
            )
        }
        
        return ResponseEntity.ok(response)
        
    }

    override fun getAllCodelists(): ResponseEntity<List<CodeList>> {
        val codelists = handler.allCodelists
        return ResponseEntity.ok(codelists)
    }

    override fun updateCodelists(): ResponseEntity<List<CodeList>> {
        val codelists = handler.fetchCodelists() ?: throw ServerException.withReason("Failed to synchronize code lists")
        return ResponseEntity.ok(codelists)
    }
}
