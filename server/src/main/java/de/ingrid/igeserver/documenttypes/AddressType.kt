package de.ingrid.igeserver.documenttypes;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OSchema;
import com.orientechnologies.orient.core.metadata.schema.OType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class AddressType extends DocumentType {

    private final Logger log = LogManager.getLogger(AddressType.class);

    private static final String TYPE = "AddressDoc";

    private static final String[] profiles = new String[0];

    public AddressType() {
        super(TYPE, profiles);
    }

    @Override
    public void initialize(ODatabaseSession session) {

        OSchema schema = session.getMetadata().getSchema();
        if (!schema.existsClass(TYPE)) {
            log.debug("Create class " + TYPE);
            OClass addressClass = schema.createClass(TYPE);
            addressClass.createProperty("_id", OType.STRING);
            addressClass.createProperty("_parent", OType.STRING);
        }

    }

}
