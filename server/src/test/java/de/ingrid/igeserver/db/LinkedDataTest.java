package de.ingrid.igeserver.db;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.db.ODatabaseType;
import com.orientechnologies.orient.core.db.OrientDB;
import com.orientechnologies.orient.core.db.OrientDBConfig;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.record.ORecord;
import com.orientechnologies.orient.core.record.impl.ODocument;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class LinkedDataTest {

    private static OrientDB db;

    private static OrientDBDatabase dbService = new OrientDBDatabase();
    private static ODatabaseSession testDB;

    @BeforeClass
    public static void before() {

        db = new OrientDB("memory:test", OrientDBConfig.defaultConfig());

        db.create("test", ODatabaseType.MEMORY);

        testDB = db.open("test", "admin", "admin");

        testDB.getMetadata().getSchema().createClass("Documents");
        testDB.getMetadata().getSchema().createClass("Addresses");
        testDB.commit();
    }

    @Before
    public void cleanup() {
        for (ODocument doc: testDB.browseClass("Documents")) {
            testDB.delete(doc);
        }
        for (ODocument address: testDB.browseClass("Addresses")) {
            testDB.delete(address);
        }
        testDB.commit();
    }

    @Test
    public void createLink() {

        ODocument address = new ODocument("Addresses");
        address.field("name", "André");
        address.field("city", "Frankfurt");
        ODocument dbAddress = address.save();

        ODocument doc = new ODocument("Documents");
        doc.field("title", "Dokument 1");
        doc.field("address", dbAddress);
        doc.save();

        testDB.commit();

        String json = testDB.browseClass("Documents").next().toJSON("fetchPlan:*:-1");
        assertEquals("{\"address\":{\"city\":\"Frankfurt\",\"name\":\"Andr\\u00e9\"},\"title\":\"Dokument 1\"}", json);

    }


    @Test
    public void updateLink() {
        ODocument address = new ODocument("Addresses");
        address.field("name", "André");
        address.field("city", "Frankfurt");
        ODocument dbAddress = address.save();

        ODocument doc = new ODocument("Documents");
        doc.field("title", "Dokument 1");
        doc.field("address", dbAddress);
        doc.save();

        testDB.commit();

        Optional<ORecord> query = testDB.query("SELECT * FROM Documents WHERE title='Dokument 1'").next().getRecord();

        assertTrue(query.isPresent());

        ODocument docFromDb = (ODocument) query.get();
        Map<String, Object> map = docFromDb.toMap();

        map.put("address.city", "Berlin");

        dbService.save(DBApi.DBClass.Documents.name(), null, map);

        //docFromDb.field("address.city", "Berlin");
        //docFromDb.save();

        testDB.commit();

        String json = testDB.browseClass("Documents").next().toJSON("fetchPlan:*:-1");
        assertEquals("{\"address\":{\"city\":\"Berlin\",\"name\":\"Andr\\u00e9\"},\"title\":\"Dokument 1\"}", json);

        assertEquals(1, testDB.countClass("Documents"));
        assertEquals(1, testDB.countClass("Addresses"));

    }

    @Test
    public void updateLinkMerge() {
        ODocument address = new ODocument("Addresses");
        address.field("name", "André");
        address.field("city", "Frankfurt");
        ODocument dbAddress = address.save();

        ODocument doc = new ODocument("Documents");
        doc.field("title", "Dokument 1");
        doc.field("address", dbAddress);
        doc.save();

        testDB.commit();

        Optional<ORecord> query = testDB.query("SELECT * FROM Documents WHERE title='Dokument 1'").next().getRecord();

        assertTrue(query.isPresent());

        ODocument docFromDb = (ODocument) query.get();
//        Map<String, Object> map = docFromDb.toMap();

//        map.put("address.city", "Berlin");

        docFromDb.field("address.city", "Berlin");
        docFromDb.save();

        testDB.commit();

        String json = testDB.browseClass("Documents").next().toJSON("fetchPlan:*:-1");
        assertEquals("{\"address\":{\"city\":\"Berlin\",\"name\":\"Andr\\u00e9\"},\"title\":\"Dokument 1\"}", json);

        assertEquals(1, testDB.countClass("Documents"));
        assertEquals(1, testDB.countClass("Addresses"));

    }

    @Test
    @Ignore
    public void updateLinkOnlyRID() {
        ODocument address = new ODocument("Addresses");
        address.field("name", "André");
        address.field("city", "Frankfurt");
        ODocument dbAddress = address.save();
        ODocument address2 = new ODocument("Addresses");
        address2.field("name", "Peter");
        address2.field("city", "München");
        ODocument dbAddress2 = address2.save();

        ODocument doc = new ODocument("Documents");
        doc.field("title", "Dokument 1");
        doc.field("description", "Beschreibung des Dokuments");
        doc.field("address", dbAddress);
        ODocument dbDoc = doc.save();

        testDB.commit();

        String json = dbDoc.toJSON("rid,version,fetchPlan:*:-1");
        Map<String, Object> map = dbDoc.toMap();


        ODocument updatedDoc = new ODocument();

        String modJson = "{\"@rid\":\"#17:0\",\"@version\":1,\"address\":{\"@rid\":\"#21:0\",\"@version\":1},\"title\":\"Dokument 1\"}";
        updatedDoc.fromJSON(modJson);

        // updatedDoc.save();
        ODocument dbMerged = dbDoc.merge(updatedDoc, true, true);
        testDB.commit();



        String jsonAfter = testDB.browseClass("Documents").next().toJSON("fetchPlan:*:-1");
        assertEquals("{\"address\":{\"city\":\"Berlin\",\"name\":\"Andr\\u00e9\"},\"title\":\"Dokument 1\"}", jsonAfter);

        assertEquals(1, testDB.countClass("Documents"));
        assertEquals(1, testDB.countClass("Addresses"));

    }

    @Test
    public void linktest() throws IOException {
        OClass addressClass = testDB.createClass("Address");
        OClass documentClass = testDB.createClass("Document");
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
        ODocument dbDoc1 = doc.save();

        testDB.commit();

        ODocument dbDoc = testDB.browseClass("Document").next();

        assertEquals("{\"@rid\":\"" + dbDoc1.getIdentity() + "\",\"address\":{\"@rid\":\"" + dbAddress1.getIdentity() + "\",\"country\":\"Germany\",\"city\":\"Frankfurt\"},\"description\":\"Beschreibung\",\"title\":\"Name des Dokuments\"}", dbDoc.toJSON("rid,fetchPlan:*:-1"));

//        dbDoc.field("address", dbAddress2.getIdentity());
        dbDoc.field("address", "34:0");
//        HashMap<Object, Object> map = new HashMap<>();
//        map.put("@rid", "#34:0");
//        dbDoc.field("address", map);

        assertEquals("{\"@rid\":\"" + dbDoc1.getIdentity() + "\",\"address\":{\"@rid\":\"" + dbAddress2.getIdentity() + "\",\"country\":\"France\",\"city\":\"Paris\"},\"description\":\"Beschreibung\",\"title\":\"Name des Dokuments\"}", dbDoc.toJSON("rid,fetchPlan:*:-1"));


        String inputJson = "{\"@rid\":\"" + dbDoc1.getIdentity() + "\",\"address\":{\"@rid\":\"" + dbAddress2.getIdentity() + "\"},\"description\":\"Beschreibung\",\"title\":\"Neuer Name des Dokuments\"}";

        ODocument docFromJson = new ODocument("Document");
        docFromJson.fromJSON(inputJson);
        assertEquals("{\"@rid\":\"" + dbDoc1.getIdentity() + "\",\"address\":{\"@rid\":\"" + dbAddress2.getIdentity() + "\",\"country\":\"France\",\"city\":\"Paris\"},\"description\":\"Beschreibung\",\"title\":\"Neuer Name des Dokuments\"}", docFromJson.toJSON("rid,fetchPlan:*:-1"));


    }

    @Test
    public void linkTestReal() throws IOException {

        // ========================================
        // DOCUMENT TYPE CLASS
        // ========================================

        // definition created from document type docType
        // {
        //   "geoservice": {
        //     "dbClass": "DOC_GEOSERVICE",
        //     "links": ["address"]
        //   },
        //   "address": {
        //     "dbClass": "MyAddress"
        //   }
        // }
        HashMap<String, Object> typeMapper = new HashMap<>();
        HashMap<String, Object> geoServiceTypeInfo = new HashMap<>();
        geoServiceTypeInfo.put("dbClass", "DOC_GEOSERVICE");
        geoServiceTypeInfo.put("links", new String[] {"address"});
        typeMapper.put("geoservice", geoServiceTypeInfo);
        HashMap<String, Object> addressTypeInfo = new HashMap<>();
        addressTypeInfo.put("dbClass", "MyAddress");
        typeMapper.put("address", addressTypeInfo);

        // creation of neccessary db classes with properties (links)
        for (String docType : typeMapper.keySet()) {
            HashMap profile = ((HashMap)typeMapper.get(docType));
            OClass documentClass = testDB.createClass((String) profile.get("dbClass"));
            String[] links = (String[]) profile.get("links");
            if (links != null) {
                for (String link : links) {
                    documentClass.createProperty(link, OType.LINK);
                }
            }
        }

        // ========================================
        // JUST SOME DEMO DATA
        // ========================================

        // set initial db data
        ODocument address = new ODocument("MyAddress");
        address.field("city", "Frankfurt");
        address.field("country", "Germany");
        ODocument dbAddress1 = address.save();

        ODocument address2 = new ODocument("MyAddress");
        address2.field("city", "Paris");
        address2.field("country", "France");
        ODocument dbAddress2 = address2.save();

        ODocument doc = new ODocument("DOC_GEOSERVICE");
        doc.field("title", "Name des Dokuments");
        doc.field("description", "Beschreibung");
        doc.field("address", dbAddress1.getIdentity());
        ODocument dbDoc1 = doc.save();

        // ========================================
        // CONTROLLER CLASS
        // ========================================

        // incoming test json from frontend
        //language=JSON
        String inputJson = "{\"@rid\":\"" + dbDoc1.getIdentity() + "\",\"_type\":\"geoservice\",\"address\":{\"@rid\":\"" + dbAddress2.getIdentity() + "\", \"city\":\"Paris\",\"country\":\"New France\"},\"description\":\"Beschreibung\",\"title\":\"Neuer Name des Dokuments\"}";

        // convert json to Node object
        ObjectNode node = (ObjectNode) new ObjectMapper().readTree(inputJson);

        // get document type from json node
        String docType = node.get("_type").asText();
        HashMap<String, Object> profileInfo = (HashMap<String, Object>) typeMapper.get(docType);

        // transform incoming document to replace nested documents with reference ID
        String[] links = (String[]) profileInfo.get("links");
        for (String link : links) {
            // set link reference into field directly
            node.put(link, node.get(link).get("@rid").textValue());
        }

        // create new db document object with defined class from document type
        String dbClass = (String) profileInfo.get("dbClass");

        // ========================================
        // DATABASE CLASS
        // ========================================
        ODocument docFromJson = new ODocument(dbClass);
        docFromJson.fromJSON(node.toString());

        assertEquals("{\"@rid\":\"" + dbDoc1.getIdentity() + "\",\"address\":{\"@rid\":\"" + dbAddress2.getIdentity() + "\",\"country\":\"France\",\"city\":\"Paris\"},\"_type\":\"geoservice\",\"description\":\"Beschreibung\",\"title\":\"Neuer Name des Dokuments\"}", docFromJson.toJSON("rid,fetchPlan:*:-1"));

        assertEquals(2, testDB.countClass("MyAddress"));
        assertEquals(1, testDB.countClass("DOC_GEOSERVICE"));

    }

}
