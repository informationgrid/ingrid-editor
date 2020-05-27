package de.ingrid.igeserver.profiles.mcloud.types;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OSchema;
import com.orientechnologies.orient.core.metadata.schema.OType;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.documenttypes.AddressWrapperType;
import de.ingrid.igeserver.documenttypes.DocumentType;
import de.ingrid.igeserver.services.DocumentService;
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
            OClass clazz = schema.createClass(TYPE);
            clazz.createProperty("_id", OType.STRING);
            clazz.createProperty("_parent", OType.STRING);

            OClass addressWrapperClass = session.getClass("AddressWrapper");
            clazz.createProperty("addresses", OType.LINKLIST, addressWrapperClass);
        }

    }

    @Override
    public void handleLinkedFields(JsonNode doc, DBApi dbService) throws ApiException {

        handleLinkedAddresses(doc, dbService);

    }

    @Override
    public void mapLatestDocReference(JsonNode doc, DocumentService docService) {

        handleLatestsAddresses(doc, docService);

    }

    private void handleLatestsAddresses(JsonNode doc, DocumentService docService) {

        JsonNode addresses = doc.path("addresses");

        for (JsonNode address : addresses) {
            String wrapperId = address.path("ref").asText();
            JsonNode wrapper = null;
            try {
                wrapper = docService.getByDocId(wrapperId, AddressWrapperType.TYPE, true);
                ObjectNode latestDocument = docService.getLatestDocument(wrapper);
                ((ObjectNode) address).put("ref", latestDocument);
            } catch (Exception e) {
                log.error(e);
            }
        }

    }

    private void handleLinkedAddresses(JsonNode doc, DBApi dbService) throws ApiException {

        JsonNode addresses = doc.path("addresses");

        for (JsonNode address : addresses) {
            String id = address.path("ref").path("_id").textValue();
            ((ObjectNode) address).put("ref", id);
        }

    }

}
