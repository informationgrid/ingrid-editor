package de.ingrid.mdek.upload.configuration;

import de.ingrid.mdek.upload.Config;
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage;
import de.ingrid.mdek.upload.storage.validate.Validator;
import org.springframework.beans.factory.BeanCreationException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Configuration
@ComponentScan(basePackages = {"de.ingrid.igeserver", "de.ingrid.mdek"})
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
