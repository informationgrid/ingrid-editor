package de.ingrid.igeserver.db;

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

import static org.junit.Assert.*;

public class OrientDBDatabaseTest {

    private static OrientDB db;

    private static OrientDBDatabase dbService = new OrientDBDatabase();

    @BeforeClass
    public static void before() {

        db = new OrientDB("memory:test", OrientDBConfig.defaultConfig());

        db.create("test", ODatabaseType.MEMORY);
        ODatabasePool pool = new ODatabasePool(db, "test", "admin", "admin");

        dbService.setOrientDB(db);

        try (ODatabaseSession session = pool.acquire()) {
            session.newInstance(DBApi.DBClass.User.name());
        }
        pool.close();
    }

    @Before
    public void cleanup() throws ApiException {
        try (ODatabaseSession session = dbService.acquire("test")) {
            for (ODocument person: session.browseClass(DBApi.DBClass.User.name())) {
                session.delete(person);
            }
//            session.
        }
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