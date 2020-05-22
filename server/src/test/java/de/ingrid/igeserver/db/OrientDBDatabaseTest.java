package de.ingrid.igeserver.db;

import com.fasterxml.jackson.databind.JsonNode;
import com.orientechnologies.orient.core.db.*;
import com.orientechnologies.orient.core.id.ORecordId;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.record.OElement;
import com.orientechnologies.orient.core.record.impl.ODocument;
import de.ingrid.igeserver.api.ApiException;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

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
            session.newInstance("User");
        }
        pool.close();
    }

    @Before
    public void cleanup() throws ApiException {
        /*try (ODatabaseSession session = dbService.acquire("test")) {
            for (ODocument person: session.browseClass("User.name())) {
                session.delete(person);
            }
//            session.
        }*/
    }

    @Test
    public void findAll() throws ApiException {

        try (ODatabaseSession session = dbService.acquire("test")) {
            session.begin();

            OElement person1 = session.newElement("User");
            person1.setProperty("name", "John");
            person1.setProperty("age", "35");
            session.save(person1);

            // new person is not yet visible outside of session
            ODatabaseSession session2 = dbService.acquire("test");
            assertEquals(0, session2.countClass("User"));

            List<JsonNode> persons = dbService.findAll(DBApi.DBClass.User.name());
            assertEquals(0, persons.size());
            session2.close();

            // set correct session to local thread
            ODatabaseRecordThreadLocal.instance().set((ODatabaseDocumentInternal) session);
            session.commit();

            // change session
            ODatabaseSession session3 = dbService.acquire("test");
            persons = dbService.findAll(DBApi.DBClass.User.name());
            assertEquals(1, persons.size());

            // set correct session to close it correctly
            ODatabaseRecordThreadLocal.instance().set((ODatabaseDocumentInternal) session);
        }
    }

    @Test
    public void findAllWithInitData() throws ApiException {
        addTestData();

        try (ODatabaseSession session = dbService.acquire("test")) {

            List<JsonNode> persons = dbService.findAll(DBApi.DBClass.User.name());

            assertEquals(2, persons.size());

        }
    }


    @Test
    public void findAllByQuery() throws ApiException {
        addTestData();

        try (ODatabaseSession session = dbService.acquire("test")) {

            Map<String, String> query = new HashMap<>();
            query.put("age", "48");
            FindOptions options = new FindOptions();
            options.queryType = QueryType.like;
            options.resolveReferences = false;
            DBFindAllResults persons = dbService.findAll("User", query, options);

            assertEquals(1, persons.totalHits);
            assertEquals(1, persons.hits.size());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    public void updateDocument() throws Exception {
        addTestData();

        String id;
        Map<String, String> query = new HashMap<>();
        query.put("age", "48");

        try (ODatabaseSession session = dbService.acquire("test")) {
            FindOptions options = new FindOptions();
            options.queryType = QueryType.like;
            options.resolveReferences = false;
            DBFindAllResults docToUpdate = dbService.findAll("User", query, options);
            id = docToUpdate.hits.get(0).get("@rid").asText();

            String data = "{\"name\": \"Johann\", \"@rid\": " + id + "}";
            JsonNode save = dbService.save("User", null, data);
            assertNotNull(save);
        }

        try (ODatabaseSession session = dbService.acquire("test")) {
            FindOptions options = new FindOptions();
            options.queryType = QueryType.like;
            options.resolveReferences = false;
            JsonNode updatedDoc = dbService.findAll("User", query, options).hits.get(0);

            assertEquals("Johann", updatedDoc.get("name").asText());
            assertEquals("48", updatedDoc.get("age").asText());
            assertEquals(id, updatedDoc.get("@rid").asText());
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
            String doc1 = "{\"title\": \"my document\"}";
            JsonNode doc1Result = dbService.save(DBApi.DBClass.Documents.name(), null, doc1);

            // add second document with reference to doc1
            List<ORecordId> addressReferences = new ArrayList<>();
            addressReferences.add(new ORecordId(doc1Result.get("@rid").asText()));
            String doc2 = "{\"title\": \"my other document with reference\", \"addresses\": " + addressReferences + "}";
            JsonNode doc2Result = dbService.save(DBApi.DBClass.Documents.name(), null, doc2);

        }

        try (ODatabaseSession session = dbService.acquire("test")) {
            List<JsonNode> docs = dbService.findAll(DBApi.DBClass.Documents.name());
            assertEquals(2, docs.size());
            assertEquals("my document", ((ODocument) ((List) docs.get(1).get("addresses")).get(0)).field("title"));
        }
        throw new Exception("Not complete testcase. Links are not maps");
    }

    @Test
    public void updateDocument1() throws Exception {
//        addTestData();

        try (ODatabaseSession session = dbService.acquire("test")) {

        }
    }

    private void addTestData() throws ApiException {
        try (ODatabaseSession session = dbService.acquire("test")) {

            String person1Map = "{ \"name\": \"John\", \"age\": \"35\"}";
            dbService.save("User", null, person1Map);

            String person2Map = "{ \"name\": \"Mike\", \"age\": \"48\"}";
            dbService.save("User", null, person2Map);

        }
    }
}
