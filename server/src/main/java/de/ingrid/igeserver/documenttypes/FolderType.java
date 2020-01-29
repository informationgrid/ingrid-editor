package de.ingrid.igeserver.documenttypes;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OSchema;
import com.orientechnologies.orient.core.metadata.schema.OType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FolderType extends DocumentType {

    private static Logger log = LogManager.getLogger(FolderType.class);

    private static final String FOLDER = "FOLDER";

    private String[] profiles = new String[0];

    @Override
    public void initialize(ODatabaseSession session) {

        OSchema schema = session.getMetadata().getSchema();
        if (!schema.existsClass(FOLDER)) {
            log.debug("Create class " + FOLDER);
            OClass addressClass = schema.createClass(FOLDER);
            addressClass.createProperty("_id", OType.STRING);
            addressClass.createProperty("_parent", OType.STRING);
        }

    }

    @Override
    String[] activeInProfiles() {
        return profiles;
    }
}
