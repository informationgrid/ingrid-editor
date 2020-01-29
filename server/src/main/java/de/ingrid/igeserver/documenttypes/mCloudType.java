package de.ingrid.igeserver.documenttypes;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OSchema;
import com.orientechnologies.orient.core.metadata.schema.OType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class mCloudType extends DocumentType {

    private static Logger log = LogManager.getLogger(mCloudType.class);

    private static final String M_CLOUD_DOC = "mCloudDoc";

    private String[] profiles = new String[]{"mcloud"};

    @Override
    public void initialize(ODatabaseSession session) {

        OSchema schema = session.getMetadata().getSchema();
        if (!schema.existsClass(M_CLOUD_DOC)) {
            log.debug("Create class " + M_CLOUD_DOC);
            OClass addressClass = schema.createClass(M_CLOUD_DOC);
            addressClass.createProperty("_id", OType.STRING);
            addressClass.createProperty("_parent", OType.STRING);
        }

    }

    @Override
    String[] activeInProfiles() {
        return profiles;
    }

}
