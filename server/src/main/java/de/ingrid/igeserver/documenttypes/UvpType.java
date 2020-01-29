package de.ingrid.igeserver.documenttypes;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OSchema;
import com.orientechnologies.orient.core.metadata.schema.OType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class UvpType extends DocumentType {

    private static Logger log = LogManager.getLogger(UvpType.class);

    private static final String UVP_DOC = "UvpDoc";

    private String[] profiles = new String[]{"uvp"};

    @Override
    public void initialize(ODatabaseSession session) {

        OSchema schema = session.getMetadata().getSchema();
        if (!schema.existsClass(UVP_DOC)) {
            log.debug("Create class " + UVP_DOC);
            OClass addressClass = schema.createClass(UVP_DOC);
            addressClass.createProperty("_id", OType.STRING);
            addressClass.createProperty("_parent", OType.STRING);
        }

    }

    @Override
    String[] activeInProfiles() {
        return profiles;
    }

}
