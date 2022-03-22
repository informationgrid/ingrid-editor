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

import de.ingrid.mdek.upload.storage.validate.Validator;
import de.ingrid.mdek.upload.storage.validate.ValidatorFactory;
import net.weta.components.communication.configuration.XPathService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@ConfigurationProperties("upload")
public class Config {

    @SuppressWarnings("unused")
    private static Log log = LogFactory.getLog( Config.class );

    /**
     * MAIL
     */
    @Value("${system.mail.receiver:}")
    public String systemMailReceiver;

    @Value("${workflow.mail.sender:}")
    public String workflowMailSender;

    @Value("${workflow.mail.receiver:}")
    public String workflowMailReceiver;

    @Value("${workflow.mail.smtp:}")
    public String workflowMailSmtpHost;

    @Value("${workflow.mail.smtp.user:}")
    public String workflowMailSmtpUser;

    @Value("${workflow.mail.smtp.password:}")
    public String workflowMailSmtpPassword;

    @Value("${workflow.mail.smtp.port:}")
    public String workflowMailSmtpPort;

    @Value("${workflow.mail.smtp.ssl:false}")
    public boolean workflowMailSmtpSSL;

    @Value("${workflow.mail.smtp.protocol:smtp}")
    public String workflowMailSmtpProtocol;

    /**
     * UPLOAD
     */
    @Value("${upload.impl:de.ingrid.mdek.upload.storage.impl.FileSystemStorage}")
    public String uploadImpl;

    @Value("${upload.docsdir:}")
    public String uploadDocsDir;

    @Value("${upload.partsdir:}")
    public String uploadPartsDir;

    @Value("${upload.tempdir:}")
    public String uploadTempDir;

    @Value("${upload.validators:}")
    public List<String> uploadValidators;

//    @TypeTransformers(de.ingrid.mdek.upload.storage.validate.config.StringToValidatorTransformer.class)
    public Map<String, Validator> uploadValidatorMap;

    @Autowired
    public void setUploadValidators(@Value("#{${upload.validators.config}}") Map<String, Map<String, Object>> values) {
        final Map<String, Validator> result = new HashMap<>();
        final ValidatorFactory factory = new ValidatorFactory(values);
        for (final String name : factory.getValidatorNames()) {
            result.put(name, factory.getValidator(name));
        }
        uploadValidatorMap = result;
    }

    @Value("${upload.trash.retentionTime:0}")
    public int uploadTrashRetentionTime;

    @Value("${upload.unsaved.retentionTime:24}")
    public int uploadUnsavedRetentionTime;

    /**
     * VARIOUS
     */
    @Value("${installation.standalone:false}")
    public boolean noPortal;

    @Value("${mdek.directLink:}")
    public String mdekDirectLink;

    private final XPathService getCommunicationTemplate() throws Exception {

        // open template xml or communication file
        final XPathService communication = new XPathService();
        final InputStream inputStream = Config.class.getResourceAsStream( "/communication-template.xml" );
        communication.registerDocument( inputStream );

        return communication;
    }

}
