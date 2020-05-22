package de.ingrid.igeserver.documenttypes;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OSchema;
import com.orientechnologies.orient.core.metadata.schema.OType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

//@Service
public class OrganizationType extends DocumentType {

    private static Logger log = LogManager.getLogger(OrganizationType.class);

    private static final String TYPE = "OrganizationDoc";

    private static final String[] profiles = new String[0];

    public OrganizationType() {
        super(TYPE, profiles);
    }

    @Override
    public void initialize(ODatabaseSession session) {

        OSchema schema = session.getMetadata().getSchema();
        if (!schema.existsClass(TYPE)) {
            log.debug("Create class " + TYPE);
            OClass myClass = schema.createClass(TYPE);
            myClass.createProperty("_id", OType.STRING);
            myClass.createProperty("_parent", OType.STRING);
        }

    }

}
