package de.ingrid.igeserver.documenttypes;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OSchema;
import com.orientechnologies.orient.core.metadata.schema.OType;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class GeoServiceType extends DocumentType {

    private static Logger log = LogManager.getLogger(GeoServiceType.class);

    private static final String GEO_SERVICE_DOC = "GeoServiceDoc";

    private String[] profiles = new String[]{"mcloud"};

    @Override
    public void initialize(ODatabaseSession session) {

        OSchema schema = session.getMetadata().getSchema();
        if (!schema.existsClass(GEO_SERVICE_DOC)) {
            log.debug("Create class " + GEO_SERVICE_DOC);
            OClass docClass = schema.createClass(GEO_SERVICE_DOC);

            // TODO: set more constraints and information for a new catalog (name, email?, ...)
            docClass.createProperty("_id", OType.STRING);
            docClass.createProperty("_parent", OType.STRING);
            docClass.createProperty("addresses", OType.LINKLIST);
//            docClass.createIndex("didIdx", OClass.INDEX_TYPE.UNIQUE, "_id");

            /*OSequenceLibrary sequenceLibrary = session.getMetadata().getSequenceLibrary();
            if (sequenceLibrary.getSequence("idseq") == null) {
                OSequence seq = sequenceLibrary.createSequence("idseq", OSequence.SEQUENCE_TYPE.ORDERED, new OSequence.CreateParams().setStart(0L).setIncrement(1));
                seq.save();

                // TODO: CREATE INDEX items.ID ON items (ID) UNIQUE
            }*/
        }

    }

    @Override
    public String[] activeInProfiles() {
        return profiles;
    }
}
