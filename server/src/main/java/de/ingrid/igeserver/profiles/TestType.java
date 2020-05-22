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

    private static final String TYPE = "TestDoc";

    private static final String[] profiles = new String[]{"mcloud"};

    public TestType() {
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
