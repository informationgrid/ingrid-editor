package de.ingrid.igeserver.documenttypes;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DocumentTypeService {

    private static Logger log = LogManager.getLogger(DocumentTypeService.class);

    private Map<String, String> docTypeMappings = new HashMap<>();

    public void register(String type, String dbClass) {
        if (docTypeMappings.containsKey(type)) {
            log.error("This document type was already registered: " + type);
            throw new RuntimeException("Document type already registered: " + type);
        }
        docTypeMappings.put(type, dbClass);
    }
}
