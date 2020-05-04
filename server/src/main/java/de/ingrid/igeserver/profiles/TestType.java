package de.ingrid.igeserver.profiles;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OSchema;
import com.orientechnologies.orient.core.metadata.schema.OType;
import de.ingrid.igeserver.documenttypes.DocumentType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class TestType extends DocumentType {

    private static Logger log = LogManager.getLogger(TestType.class);

    private static final String DOC_ID = "TestDoc";

    private String[] profiles = new String[]{"mcloud"};

    @Override
    public void initialize(ODatabaseSession session) {

        OSchema schema = session.getMetadata().getSchema();
        if (!schema.existsClass(DOC_ID)) {
            log.debug("Create class " + DOC_ID);
            OClass myClass = schema.createClass(DOC_ID);
            myClass.createProperty("_id", OType.STRING);
            myClass.createProperty("_parent", OType.STRING);
        }

    }

    @Override
    public String[] activeInProfiles() {
        return profiles;
    }

}
