package de.ingrid.igeserver.configuration

import de.ingrid.codelists.CodeListService
import de.ingrid.codelists.comm.HttpCLCommunication
import de.ingrid.codelists.comm.ICodeListCommunication
import de.ingrid.codelists.persistency.ICodeListPersistency
import de.ingrid.codelists.persistency.XmlCodeListPersistency
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.*

@Configuration
@ComponentScan(basePackages = ["de.ingrid.igeserver", "de.ingrid.elasticsearch"])
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