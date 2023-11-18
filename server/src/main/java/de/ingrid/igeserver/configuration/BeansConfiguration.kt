package de.ingrid.igeserver.configuration

import com.fasterxml.jackson.databind.ObjectMapper
import de.ingrid.codelists.CodeListService
import de.ingrid.codelists.comm.HttpCLCommunication
import de.ingrid.codelists.comm.ICodeListCommunication
import de.ingrid.codelists.persistency.ICodeListPersistency
import de.ingrid.codelists.persistency.XmlCodeListPersistency
import org.hibernate.cfg.AvailableSettings
import org.hibernate.type.format.jackson.JacksonJsonFormatMapper
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration


@Configuration
//@ComponentScan(basePackages = ["de.ingrid.igeserver"])
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
    fun codeListService(
        communication: ICodeListCommunication?,
        persistencies: List<ICodeListPersistency?>?
    ): CodeListService {
        val service = CodeListService()
        service.setPersistencies(persistencies)
        service.setComm(communication)
        service.setDefaultPersistency(0)
        return service
    }

    /**
     * This mapper is needed to correctly convert JSONB columns into Classes, especially OffsetDateTime!
     */
    @Bean
    fun jsonFormatMapperCustomizer(objectMapper: ObjectMapper): HibernatePropertiesCustomizer {
        return HibernatePropertiesCustomizer { properties: MutableMap<String, Any> ->
            properties[AvailableSettings.JSON_FORMAT_MAPPER] = JacksonJsonFormatMapper(objectMapper)
        }
    }
}
