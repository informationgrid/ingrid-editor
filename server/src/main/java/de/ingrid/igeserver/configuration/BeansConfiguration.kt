package de.ingrid.igeserver.configuration

import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer
import de.ingrid.codelists.CodeListService
import de.ingrid.codelists.comm.HttpCLCommunication
import de.ingrid.codelists.comm.ICodeListCommunication
import de.ingrid.codelists.persistency.ICodeListPersistency
import de.ingrid.codelists.persistency.XmlCodeListPersistency
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer
import org.springframework.context.annotation.*
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter


@Configuration
@ComponentScan(basePackages = ["de.ingrid.igeserver", "de.ingrid.elasticsearch"],
        excludeFilters = [
            // exclude all database adapters, the current adapter will be activated by the appropriate spring profile
            ComponentScan.Filter(type = FilterType.REGEX, pattern = ["de\\.ingrid\\.igeserver\\.persistence\\.(orientdb|postgresql)\\..*"]),
            // exclude migrations (will be activated when using the 'orientdb' spring profile)
            ComponentScan.Filter(type = FilterType.REGEX, pattern = ["de\\.ingrid\\.igeserver\\.migrations\\..*"])
        ]
)
class BeansConfiguration {
    @Value("\${codelist.url:http://localhost:9000}")
    private val codelistUrl: String? = null

    @Value("\${codelist.username}")
    private val codelistUserName: String? = null

    @Value("\${codelist.password}")
    private val codelistPassword: String? = null

    @Value("\${codelist.data-path:codelists}")
    private val codelistDataPath: String? = null

    @Bean
    fun HttpCodelistCommunication(): ICodeListCommunication {
        val communication = HttpCLCommunication()
        communication.setRequestUrl("$codelistUrl/rest/getCodelists")
        communication.setUsername(codelistUserName)
        communication.setPassword(codelistPassword)
        return communication
    }

    @Bean
    fun codeListPersistency(): ICodeListPersistency {
        val persistency = XmlCodeListPersistency<Any>()
        persistency.setPathToXml(codelistDataPath)
        return persistency
    }

    @Bean
    fun codeListService(communication: ICodeListCommunication?,
                        persistencies: List<ICodeListPersistency?>?): CodeListService {
        val service = CodeListService()
        service.setPersistencies(persistencies)
        service.setComm(communication)
        service.setDefaultPersistency(0)
        return service
    }
}

@Configuration
@Profile("orientdb")
@ComponentScan(basePackages = ["de.ingrid.igeserver.persistence.orientdb", "de.ingrid.igeserver.migrations"])
class OrientDBConfig

@Configuration
@Profile("postgresql")
@ComponentScan(basePackages = ["de.ingrid.igeserver.persistence.postgresql"])
class PostgreSQLConfig