package de.ingrid.igeserver.configuration;

import de.ingrid.codelists.CodeListService;
import de.ingrid.codelists.comm.HttpCLCommunication;
import de.ingrid.codelists.comm.ICodeListCommunication;
import de.ingrid.codelists.persistency.ICodeListPersistency;
import de.ingrid.codelists.persistency.XmlCodeListPersistency;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class BeansConfiguration {


    @Value("${codelist.url:http://localhost:9000}")
    private String codelistUrl;

    @Value("${codelist.username}")
    private String codelistUserName;

    @Value("${codelist.password}")
    private String codelistPassword;

    @Value("${codelist.data-path:codelists}")
    private String codelistDataPath;

    @Bean
    public ICodeListCommunication HttpCodelistCommunication() {

        HttpCLCommunication communication = new HttpCLCommunication();
        communication.setRequestUrl(codelistUrl + "/rest/getCodelists");
        communication.setUsername(codelistUserName);
        communication.setPassword(codelistPassword);
        return communication;

    }


    @Bean
    public ICodeListPersistency codeListPersistency() {

        XmlCodeListPersistency<Object> persistency = new XmlCodeListPersistency<>();
        persistency.setPathToXml(codelistDataPath);
        return persistency;

    }


    @Bean
    public CodeListService codeListService(ICodeListCommunication communication,
                                           List<ICodeListPersistency> persistencies) {

        CodeListService service = new CodeListService();

        service.setPersistencies(persistencies);
        service.setComm(communication);
        service.setDefaultPersistency(0);
        return service;

    }

}
