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
package de.ingrid.mdek.upload.configuration;

import de.ingrid.mdek.upload.Config;
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage;
import de.ingrid.mdek.upload.storage.validate.Validator;
import org.springframework.beans.factory.BeanCreationException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Configuration
@ComponentScan(basePackages = {"de.ingrid.igeserver", "de.ingrid.mdek"}, excludeFilters = @ComponentScan.Filter(
        type = FilterType.CUSTOM,
        classes = ProfileFilter.class
))
public class SpringConfiguration {

    @Bean
    public FileSystemStorage storage(Config config) {
        switch (config.uploadImpl) {
            case "de.ingrid.mdek.upload.storage.impl.FileSystemStorage":
            default:
                final FileSystemStorage instance = new FileSystemStorage();
                instance.setDocsDir(config.uploadDocsDir);
                instance.setPartsDir(config.uploadPartsDir);
                instance.setTempDir(config.uploadTempDir);
                instance.setTrashRetentionTime(config.uploadTrashRetentionTime);
                instance.setUnsavedRetentionTime(config.uploadUnsavedRetentionTime);

                // validators
                final List<Validator> validators = new ArrayList<Validator>();
                final Map<String, Validator> uploadValidatorMap = config.uploadValidatorMap;
                for (final String validatorName : config.uploadValidators) {
                    if (uploadValidatorMap.containsKey(validatorName)) {
                        validators.add(uploadValidatorMap.get(validatorName));
                    }
                    else {
                        throw new BeanCreationException("Error creating upload instance: A validator with name '"+validatorName+"' is not defined in 'upload.validators.config'.");
                    }
                }
                instance.setValidators(validators);

                return instance;
        }
    }
}
