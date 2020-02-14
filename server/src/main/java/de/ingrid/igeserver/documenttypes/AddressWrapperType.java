package de.ingrid.igeserver.documenttypes;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OSchema;
import com.orientechnologies.orient.core.metadata.schema.OType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class AddressWrapperType extends DocumentType {

    private static Logger log = LogManager.getLogger(AddressWrapperType.class);

    public static final String ADDRESS_WRAPPER = "AddressWrapper";

    private String[] profiles = new String[0];

    @Override
    public void initialize(ODatabaseSession session) {

        OSchema schema = session.getMetadata().getSchema();
        if (!schema.existsClass(ADDRESS_WRAPPER)) {
            log.debug("Create class " + ADDRESS_WRAPPER);
            OClass docClass = schema.createClass(ADDRESS_WRAPPER);

            // TODO: set more constraints and information for a new catalog (name, email?, ...)
            docClass.createProperty("_id", OType.STRING);
            docClass.createProperty("_parent", OType.STRING);
            docClass.createProperty("draft", OType.LINK);
            docClass.createProperty("published", OType.LINK);
            docClass.createProperty("archive", OType.LINKLIST);
        }

    }

    @Override
    String[] activeInProfiles() {
        return profiles;
    }
}
