package de.ingrid.igeserver.api

import de.ingrid.igeserver.index.IndexOptions
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.model.IndexRequestOptions
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.FIELD_CATEGORY
import de.ingrid.igeserver.services.FIELD_PUBLISHED
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class IndexApiController @Autowired constructor(private val catalogService: CatalogService, private val dbService: DBApi, private val indexService: IndexService) : IndexApi {
    override fun startIndexing(principal: Principal?, options: IndexRequestOptions): ResponseEntity<Void> {

//        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(options.catalogId).use {

            val onlyPublishedDocs = listOf(
                    QueryField(FIELD_PUBLISHED, null, true),
                    QueryField(FIELD_CATEGORY, DocumentCategory.DATA.value)
            )

            val indexOptions = IndexOptions(onlyPublishedDocs, options.format)
            indexService.start(indexOptions)

        }

        return ResponseEntity.ok().build()
    }
}
