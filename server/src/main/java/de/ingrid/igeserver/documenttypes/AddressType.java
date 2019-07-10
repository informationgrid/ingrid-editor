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
public class AddressType implements DocumentType {

    private static Logger log = LogManager.getLogger(AddressType.class);

    private static final String ADDRESSES = "AddressDoc";

    @Autowired
    private DocumentTypeService documentTypeService;

    @Override
    public void initialize(ODatabaseSession session) {

        OSchema schema = session.getMetadata().getSchema();
        if (!schema.existsClass(ADDRESSES)) {
            log.debug("Create class " + ADDRESSES);
            OClass addressClass = schema.createClass(ADDRESSES);
            addressClass.createProperty("_id", OType.STRING);
            addressClass.createProperty("_parent", OType.STRING);
        }

        // documentTypeService.register("address", ADDRESSES);

    }
}
