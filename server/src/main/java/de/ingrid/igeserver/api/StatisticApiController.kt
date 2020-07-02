package de.ingrid.igeserver.api

import de.ingrid.igeserver.db.DBApi
import de.ingrid.igeserver.model.StatisticResponse
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.DBUtils
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
    private lateinit var dbUtils: DBUtils

    override fun getStatistic(principal: Principal?): ResponseEntity<StatisticResponse> {

        val dbId = dbUtils.getCurrentCatalogForPrincipal(principal)

        dbApi.acquire(dbId).use {
            val statistic = this.dbService.getDocStatistic()
            return ResponseEntity.ok(statistic)
        }

    }

}