package de.ingrid.igeserver.db;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.github.fge.jackson.JsonLoader;
import com.orientechnologies.orient.core.db.*;
import com.orientechnologies.orient.core.id.ORecordId;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.record.OElement;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.record.impl.ODocumentEntry;
import de.ingrid.igeserver.api.ApiException;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.keycloak.util.JsonSerialization;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class OrientDBDatabaseTest {

    private static OrientDB db;

    private static OrientDBDatabase dbService = new OrientDBDatabase();

    @BeforeClass
    public static void before() {

        db = new OrientDB("memory:test", OrientDBConfig.defaultConfig());

        db.create("test", ODatabaseType.MEMORY);
        ODatabasePool pool = new ODatabasePool(db, "test", "admin", "admin");

        try (ODatabaseSession session = pool.acquire()) {
            session.newInstance(DBApi.DBClass.User.name());
        }
        pool.close();
    }

    @Before
    public void cleanup() throws ApiException {
        /*try (ODatabaseSession session = dbService.acquire("test")) {
            for (ODocument person: session.browseClass(DBApi.DBClass.User.name())) {
                session.delete(person);
            }
//            session.
        }*/
    }

    @Test
    public void findAll() throws ApiException {

        try (ODatabaseSession session = dbService.acquire("test")) {
            session.begin();

            OElement person1 = session.newElement(DBApi.DBClass.User.name());
            person1.setProperty("name", "John");
            person1.setProperty("age", "35");
            session.save(person1);

            // new person is not yet visible outside of session
            ODatabaseSession session2 = dbService.acquire("test");
            assertEquals(0, session2.countClass(DBApi.DBClass.User.name()));

            List<Map> persons = dbService.findAll(DBApi.DBClass.User);
            assertEquals(0, persons.size());
            session2.close();

            // set correct session to local thread
            ODatabaseRecordThreadLocal.instance().set((ODatabaseDocumentInternal) session);
            session.commit();

            // change session
            ODatabaseSession session3 = dbService.acquire("test");
            persons = dbService.findAll(DBApi.DBClass.User);
            assertEquals(1, persons.size());

            // set correct session to close it correctly
            ODatabaseRecordThreadLocal.instance().set((ODatabaseDocumentInternal) session);
        }
    }

    @Test
    public void findAllWithInitData() throws ApiException {
        addTestData();

        try (ODatabaseSession session = dbService.acquire("test")) {

            List<Map> persons = dbService.findAll(DBApi.DBClass.User);

            assertEquals(2, persons.size());

        }
    }


    @Test
    public void findAllByQuery() throws ApiException {
        addTestData();

        try (ODatabaseSession session = dbService.acquire("test")) {

            Map<String, String> query = new HashMap<>();
            query.put("age", "48");
            List<Map> persons = dbService.findAll(DBApi.DBClass.User, query, false);

            assertEquals(1, persons.size());

        }
    }

    @Test
    public void updateDocument() throws ApiException {
        addTestData();

        ORecordId id;
        Map<String, String> query = new HashMap<>();
        query.put("age", "48");

        try (ODatabaseSession session = dbService.acquire("test")) {
            List<Map> docToUpdate = dbService.findAll(DBApi.DBClass.User, query, false);
            id = (ORecordId)docToUpdate.get(0).get("@rid");

            Map<String, Object> data = new HashMap<>();
            data.put("name", "Johann");
            data.put("@rid", id);
            Map save = dbService.save(DBApi.DBClass.User, null, data);
            assertNotNull(save);
        }

        try (ODatabaseSession session = dbService.acquire("test")) {
            Map updatedDoc = dbService.findAll(DBApi.DBClass.User, query, false).get(0);

            assertEquals("Johann", updatedDoc.get("name") );
            assertEquals("48", updatedDoc.get("age") );
            assertEquals(id, updatedDoc.get("@rid") );
        }
    }

    @Test
    public void saveReferences() throws Exception {
//        addTestData();

        try (ODatabaseSession session = dbService.acquire("test")) {

            // create document class with linked list property to address-references
            OClass docClass = session.createClass(DBApi.DBClass.Documents.name());
            docClass.createProperty("addresses", OType.LINKLIST, docClass);

            // add first document
            Map<String, Object> doc1 = new HashMap<>();
            doc1.put("title", "my document");
            Map doc1Result = dbService.save(DBApi.DBClass.Documents, null, doc1);

            // add second document with reference to doc1
            Map<String, Object> doc2 = new HashMap<>();
            doc2.put("title", "my other document with reference");
            List<ORecordId> addressReferences = new ArrayList<>();
            addressReferences.add((ORecordId) doc1Result.get("@rid"));
            doc2.put("addresses", addressReferences);
            Map doc2Result = dbService.save(DBApi.DBClass.Documents, null, doc2);

        }

        try (ODatabaseSession session = dbService.acquire("test")) {
            List<Map> docs = dbService.findAll(DBApi.DBClass.Documents);
            assertEquals(2, docs.size());
            assertEquals("my document", ((ODocument)((List)docs.get(1).get("addresses")).get(0)).field("title"));
        }
        throw new Exception("Not complete testcase. Links are not maps");
    }


    @Test
    public void linktest() throws IOException {
        ODatabaseSession session = db.open("test", "admin", "admin");
        OClass addressClass = session.createClass("Address");
        OClass documentClass = session.createClass("Document");
        documentClass.createProperty("address", OType.LINK, addressClass);


        ODocument address = new ODocument("Address");
        address.field("city", "Frankfurt");
        address.field("country", "Germany");
        ODocument dbAddress1 = address.save();
        ODocument address2 = new ODocument("Address");
        address2.field("city", "Paris");
        address2.field("country", "France");
        ODocument dbAddress2 = address2.save();

        ODocument doc = new ODocument("Document");
        doc.field("title", "Name des Dokuments");
        doc.field("description", "Beschreibung");
        doc.field("address", dbAddress1.getIdentity());
        doc.save();

        session.commit();

        ODocument dbDoc = session.browseClass("Document").next();

        assertEquals("{\"@rid\":\"#41:0\",\"address\":{\"@rid\":\"#33:0\",\"country\":\"Germany\",\"city\":\"Frankfurt\"},\"description\":\"Beschreibung\",\"title\":\"Name des Dokuments\"}", dbDoc.toJSON("rid,fetchPlan:*:-1"));

//        dbDoc.field("address", dbAddress2.getIdentity());
        dbDoc.field("address", "34:0");
//        HashMap<Object, Object> map = new HashMap<>();
//        map.put("@rid", "#34:0");
//        dbDoc.field("address", map);

        assertEquals("{\"@rid\":\"#41:0\",\"address\":{\"@rid\":\"#34:0\",\"country\":\"France\",\"city\":\"Paris\"},\"description\":\"Beschreibung\",\"title\":\"Name des Dokuments\"}", dbDoc.toJSON("rid,fetchPlan:*:-1"));


        String inputJson = "{\"@rid\":\"41:0\",\"address\":{\"@rid\":\"#34:0\"},\"description\":\"Beschreibung\",\"title\":\"Neuer Name des Dokuments\"}";

        ODocument docFromJson = new ODocument("Document");
        docFromJson.fromJSON(inputJson);
        assertEquals("{\"@rid\":\"#41:0\",\"address\":{\"@rid\":\"#34:0\",\"country\":\"France\",\"city\":\"Paris\"},\"description\":\"Beschreibung\",\"title\":\"Neuer Name des Dokuments\"}", docFromJson.toJSON("rid,fetchPlan:*:-1"));


    }

    @Test
    public void linkTestReal() throws IOException {

        // definition created from document type profile
        HashMap<String, Object> typeMapper = new HashMap<>();
        HashMap<String, Object> geoServiceTypeInfo = new HashMap<>();
        geoServiceTypeInfo.put("dbClass", "DOC_GEOSERVICE");
        geoServiceTypeInfo.put("links", new String[] {"address"});
        typeMapper.put("geoservice", geoServiceTypeInfo);
        HashMap<String, Object> addressTypeInfo = new HashMap<>();
        addressTypeInfo.put("dbClass", "Address");
        typeMapper.put("address", addressTypeInfo);

        // creation of neccessary db classes with properties (links)
        ODatabaseSession session = db.open("test", "admin", "admin");

        for (String docType : typeMapper.keySet()) {
            HashMap profile = ((HashMap)typeMapper.get(docType));
            OClass documentClass = session.createClass((String) profile.get("dbClass"));
            String[] links = (String[]) profile.get("links");
            if (links != null) {
                for (String link : links) {
                    documentClass.createProperty(link, OType.LINK);
                }
            }
        }

        // set initial db data
        ODocument address = new ODocument("Address");
        address.field("city", "Frankfurt");
        address.field("country", "Germany");
        ODocument dbAddress1 = address.save();

        ODocument address2 = new ODocument("Address");
        address2.field("city", "Paris");
        address2.field("country", "France");
        ODocument dbAddress2 = address2.save();

        ODocument doc = new ODocument("DOC_GEOSERVICE");
        doc.field("title", "Name des Dokuments");
        doc.field("description", "Beschreibung");
        doc.field("address", dbAddress1.getIdentity());
        doc.save();

        // incoming test json from frontend
        //language=JSON
        String inputJson = "{\"@rid\":\"41:0\",\"_type\":\"geoservice\",\"address\":{\"@rid\":\"#34:0\", \"city\":\"Paris\",\"country\":\"New France\"},\"description\":\"Beschreibung\",\"title\":\"Neuer Name des Dokuments\"}";

        ObjectNode node = (ObjectNode) new ObjectMapper().readTree(inputJson);

        String profile = node.get("_type").asText();
        HashMap<String, Object> profileInfo = (HashMap<String, Object>) typeMapper.get(profile);



        // transform incoming document to replace nested documents with reference ID
        String[] links = (String[]) profileInfo.get("links");
        for (String link : links) {
            // set link reference into field directly
            node.put(link, node.get(link).get("@rid").textValue());
        }

        ODocument docFromJson = new ODocument((String) profileInfo.get("dbClass"));
        docFromJson.fromJSON(node.toString());

        assertEquals("{\"@rid\":\"#41:0\",\"address\":{\"@rid\":\"#34:0\",\"country\":\"France\",\"city\":\"Paris\"},\"_type\":\"geoservice\",\"description\":\"Beschreibung\",\"title\":\"Neuer Name des Dokuments\"}", docFromJson.toJSON("rid,fetchPlan:*:-1"));

        assertEquals(2, session.countClass("Address"));
        assertEquals(1, session.countClass("DOC_GEOSERVICE"));

    }

    private void addTestData() throws ApiException {
        try (ODatabaseSession session = dbService.acquire("test")) {

            Map<String, Object> person1Map = new HashMap<>();
            person1Map.put("name", "John");
            person1Map.put("age", "35");
            dbService.save(DBApi.DBClass.User, null, person1Map);

            Map<String, Object> person2Map = new HashMap<>();
            person2Map.put("name", "Mike");
            person2Map.put("age", "48");
            dbService.save(DBApi.DBClass.User, null, person2Map);

        }
    }
}
