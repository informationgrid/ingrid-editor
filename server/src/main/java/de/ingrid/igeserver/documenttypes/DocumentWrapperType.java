package de.ingrid.igeserver.documenttypes;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OSchema;
import com.orientechnologies.orient.core.metadata.schema.OType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class DocumentWrapperType extends DocumentType {

    private static Logger log = LogManager.getLogger(DocumentWrapperType.class);

    public static final String DOCUMENT_WRAPPER = "DocumentWrapper";
    public static final String ADDRESS_WRAPPER = "AddressWrapper";

    private String[] profiles = new String[0];

    @Override
    public void initialize(ODatabaseSession session) {

        OSchema schema = session.getMetadata().getSchema();
        if (!schema.existsClass(DOCUMENT_WRAPPER)) {
            log.debug("Create class " + DOCUMENT_WRAPPER);
            OClass docClass = schema.createClass(DOCUMENT_WRAPPER);

            // TODO: set more constraints and information for a new catalog (name, email?, ...)
            docClass.createProperty("_id", OType.STRING);
            docClass.createProperty("_parent", OType.STRING);
            docClass.createProperty("draft", OType.LINK);
            docClass.createProperty("published", OType.LINK);
            docClass.createProperty("archive", OType.LINKLIST);
        }

    }

    @Override
    public String[] activeInProfiles() {
        return profiles;
    }
}
