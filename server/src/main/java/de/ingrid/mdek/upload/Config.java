/*
 * **************************************************-
 * ingrid-base-webapp
 * ==================================================
 * Copyright (C) 2014 - 2021 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.1 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * http://ec.europa.eu/idabc/eupl5
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 * **************************************************#
 */
package de.ingrid.mdek.upload;

import com.tngtech.configbuilder.annotation.configuration.LoadingOrder;
import com.tngtech.configbuilder.annotation.propertyloaderconfiguration.PropertiesFiles;
import com.tngtech.configbuilder.annotation.propertyloaderconfiguration.PropertyLocations;
import com.tngtech.configbuilder.annotation.typetransformer.CharacterSeparatedStringToStringListTransformer;
import com.tngtech.configbuilder.annotation.typetransformer.TypeTransformers;
import com.tngtech.configbuilder.annotation.valueextractor.CommandLineValue;
import com.tngtech.configbuilder.annotation.valueextractor.DefaultValue;
import com.tngtech.configbuilder.annotation.valueextractor.EnvironmentVariableValue;
import com.tngtech.configbuilder.annotation.valueextractor.PropertyValue;
import com.tngtech.configbuilder.annotation.valueextractor.SystemPropertyValue;
import de.ingrid.mdek.upload.storage.validate.Validator;
import net.weta.components.communication.configuration.XPathService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.File;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@PropertiesFiles({ "mdek" })
@PropertyLocations(fromClassLoader = true)
@LoadingOrder({CommandLineValue.class, SystemPropertyValue.class, PropertyValue.class, EnvironmentVariableValue.class, DefaultValue.class})
public class Config {

    @SuppressWarnings("unused")
    private static Log log = LogFactory.getLog( Config.class );


    /**
     * COMMUNICATION - SETTINGS
     */
    @SystemPropertyValue("communication")
    @PropertyValue("communication.properties")
    @DefaultValue("communication.xml")
    public String communicationLocation;

    @PropertyValue("communication.server.name")
    @DefaultValue("")
    public String ibusName;

    @PropertyValue("communication.server.port")
    @DefaultValue("")
    public String ibusPort;

    @PropertyValue("communication.server.timeout")
    @DefaultValue("10")
    public int ibusTimeout;

    @PropertyValue("communication.server.maxMsgSize")
    @DefaultValue("3145728")
    public int ibusMaxMsgSize;

    @PropertyValue("communication.server.threadCount")
    @DefaultValue("100")
    public int ibusThreadCount;

    @PropertyValue("communication.server.msgTimeout")
    @DefaultValue("30")
    private String ibusMsgTimeout;

    @PropertyValue("communication.server.queueSize")
    @DefaultValue("2000")
    private String ibusQueueSize;


    /**
     * CODELIST - REPOSITORY
     */
    @PropertyValue("codelist.requestUrl")
    @DefaultValue("http://localhost:8089/rest/getCodelists")
    public String codelistRequestUrl;

    @PropertyValue("codelist.username")
    public String codelistUsername;

    @PropertyValue("codelist.password")
    public String codelistPassword;

    @PropertyValue("codelist.communicationType")
    @DefaultValue("http")
    public String codelistCommunicationType;

    @PropertyValue("codelist.defaultPersistency")
    @DefaultValue("0")
    public int codelistDefaultPersistency;

    /**
     * MAIL
     */
    @PropertyValue("system.mail.receiver")
    @DefaultValue("")
    public String systemMailReceiver;

    @PropertyValue("workflow.mail.sender")
    @DefaultValue("")
    public String workflowMailSender;

    @PropertyValue("workflow.mail.receiver")
    @DefaultValue("")
    public String workflowMailReceiver;

    @PropertyValue("workflow.mail.smtp")
    @DefaultValue("")
    public String workflowMailSmtpHost;

    @PropertyValue("workflow.mail.smtp.user")
    @DefaultValue("")
    public String workflowMailSmtpUser;

    @PropertyValue("workflow.mail.smtp.password")
    @DefaultValue("")
    public String workflowMailSmtpPassword;

    @PropertyValue("workflow.mail.smtp.port")
    @DefaultValue("")
    public String workflowMailSmtpPort;

    @PropertyValue("workflow.mail.smtp.ssl")
    @DefaultValue("false")
    public boolean workflowMailSmtpSSL;

    @PropertyValue("workflow.mail.smtp.protocol")
    @DefaultValue("smtp")
    public String workflowMailSmtpProtocol;

    /**
     * UPLOAD
     */
    @PropertyValue("upload.impl")
    @DefaultValue("de.ingrid.mdek.upload.storage.impl.FileSystemStorage")
    public String uploadImpl;

    @PropertyValue("upload.docsdir")
    @DefaultValue("")
    public String uploadDocsDir;

    @PropertyValue("upload.partsdir")
    @DefaultValue("")
    public String uploadPartsDir;

    @PropertyValue("upload.tempdir")
    @DefaultValue("")
    public String uploadTempDir;

    @PropertyValue("upload.validators")
    @TypeTransformers(CharacterSeparatedStringToStringListTransformer.class)
    public List<String> uploadValidators;

    @PropertyValue("upload.validators.config")
    @TypeTransformers(de.ingrid.mdek.upload.storage.validate.config.StringToValidatorTransformer.class)
    public Map<String, Validator> uploadValidatorMap;

    /**
     * VARIOUS
     */
    @PropertyValue("installation.standalone")
    @DefaultValue("false")
    public boolean noPortal;

    @PropertyValue("mdek.directLink")
    @DefaultValue("")
    public String mdekDirectLink;

    /**
     * used in UVP profile
     */
    @PropertyValue("mdek.nominatimBaseURL")
    @DefaultValue("https://nominatim.openstreetmap.org")
    public String nominatimBaseURL;

    public void initialize() {
        System.setProperty( "spring.profiles.active", "http" );
        writeCommunication();
    }

    public boolean writeCommunication() {
        File communicationFile = new File( this.communicationLocation );
        if (ibusName.isEmpty() || ibusPort.isEmpty()) {
            // do not remove communication file if no
            if(communicationFile.exists() && communicationFile.delete()) {
                log.debug("Delete communication.");
            }
            return true;
        }

        try {
            final XPathService communication = getCommunicationTemplate();
            Integer id = 0;

            communication.removeNode( "/communication/server", id );

            // create default nodes and attributes if server tag does not exist

            communication.addNode( "/communication", "server", id );
            communication.addAttribute( "/communication/server", "name", ibusName, id );

            communication.addNode( "/communication/server", "socket", id );
            communication.addNode( "/communication/server", "messages", id );

            communication.addAttribute( "/communication/server/messages", "maximumSize", "" + this.ibusMaxMsgSize, id );
            communication.addAttribute( "/communication/server/messages", "threadCount", "" + this.ibusThreadCount, id );

            communication.addAttribute( "/communication/server/socket", "port", "" + ibusPort, id );
            communication.addAttribute( "/communication/server/socket", "timeout", "" + this.ibusTimeout, id );

            communication.addNode( "/communication", "messages", id );
            communication.addAttribute( "/communication/messages", "handleTimeout", this.ibusMsgTimeout, id );
            communication.addAttribute( "/communication/messages", "queueSize", this.ibusQueueSize, id );

            communication.store( communicationFile );

        } catch (Exception e) {
            log.error("Error on writeCommunication.", e);
            return false;
        }

        return true;
    }

    private final XPathService getCommunicationTemplate() throws Exception {

        // open template xml or communication file
        final XPathService communication = new XPathService();
        final InputStream inputStream = Config.class.getResourceAsStream( "/communication-template.xml" );
        communication.registerDocument( inputStream );

        return communication;
    }

}
