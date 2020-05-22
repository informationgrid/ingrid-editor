package de.ingrid.igeserver.profiles.mcloud.types;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OSchema;
import com.orientechnologies.orient.core.metadata.schema.OType;
import de.ingrid.igeserver.documenttypes.DocumentType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class mCloudType extends DocumentType {

    private static Logger log = LogManager.getLogger(mCloudType.class);

    private static final String TYPE = "mCloudDoc";

    private static final String[] profiles = new String[]{"mcloud"};

    public mCloudType() {
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
