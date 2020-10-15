package de.ingrid.igeserver.api

import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.model.StatisticResponse
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.CatalogService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class StatisticApiController : StatisticApi {

    @Autowired
    private lateinit var dbApi: DBApi

    @Autowired
    private lateinit var dbService: DocumentService

    @Autowired
    private lateinit var catalogService: CatalogService

    override fun getStatistic(principal: Principal?): ResponseEntity<StatisticResponse> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbApi.acquireCatalog(dbId).use {
            val statistic = this.dbService.getDocumentStatistic()
            return ResponseEntity.ok(statistic)
        }
    }
}