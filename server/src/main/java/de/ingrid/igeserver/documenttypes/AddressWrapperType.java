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

    public static final String TYPE = "AddressWrapper";

    private static final String[] profiles = new String[0];

    public AddressWrapperType() {
        super(TYPE, profiles);
    }

    @Override
    public void initialize(ODatabaseSession session) {

        OSchema schema = session.getMetadata().getSchema();
        if (!schema.existsClass(TYPE)) {
            log.debug("Create class " + TYPE);
            OClass docClass = schema.createClass(TYPE);

            // TODO: set more constraints and information for a new catalog (name, email?, ...)
            docClass.createProperty("_id", OType.STRING);
            docClass.createProperty("_parent", OType.STRING);
            docClass.createProperty("draft", OType.LINK);
            docClass.createProperty("published", OType.LINK);
            docClass.createProperty("archive", OType.LINKLIST);
        }

    }

}
