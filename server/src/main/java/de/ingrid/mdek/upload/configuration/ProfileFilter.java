package de.ingrid.mdek.upload.configuration;

import org.springframework.core.type.ClassMetadata;
import org.springframework.core.type.classreading.MetadataReader;
import org.springframework.core.type.classreading.MetadataReaderFactory;
import org.springframework.core.type.filter.TypeFilter;

import java.io.IOException;

/**
 * This filter allows all classes to be instantiated directly beneath package "de.ingrid.igeserver.profiles"
 * but not the sub-packages. These need to be included by a profile configuration, which is activated by a spring profile
 */
public class ProfileFilter implements TypeFilter {

    @Override
    public boolean match(MetadataReader metadataReader,
                         MetadataReaderFactory metadataReaderFactory) throws IOException {
        ClassMetadata classMetadata = metadataReader.getClassMetadata();
        String fullyQualifiedName = classMetadata.getClassName();
        return fullyQualifiedName.startsWith("de.ingrid.igeserver.profiles.") && fullyQualifiedName.lastIndexOf('.') != "de.ingrid.igeserver.profiles.".length() - 1;
    }
}