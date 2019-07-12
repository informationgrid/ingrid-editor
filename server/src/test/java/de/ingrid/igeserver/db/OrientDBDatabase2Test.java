package de.ingrid.igeserver.db;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.Iterator;

public class OrientDBDatabase2Test {

    private static OrientDBDatabase2 dbService = new OrientDBDatabase2();

    @BeforeClass
    public static void before() throws Exception {

        dbService.init("/db.config.in.memory.xml");

        dbService.createDatabase("test", null);

    }

    @AfterClass
    public static void cleanup() {
        dbService.shutdown();
    }

    @Test
    public void findAll() throws JSONException {

        try (OrientDbSession session = dbService.getSession("test")) {
            session.save(DBApi2.EntityType.User.name(), new JSONObject("{\"name\":\"user\"}"));

            Iterator<JSONObject> it = session.findAll(DBApi2.EntityType.User.name());
            Assert.assertTrue(it.hasNext());
            JSONObject o = it.next();
            Assert.assertEquals("user", o.getString("name"));
        }

    }


    @Test
    public void find() throws JSONException {

        try (OrientDbSession session = dbService.getSession("test")) {
            JSONObject o = session.save(DBApi2.EntityType.User.name(), new JSONObject("{\"name\":\"user\"}"));
            JSONObject result = session.find(DBApi2.EntityType.User.name(), o.getString("@rid"));
            Assert.assertEquals("user", result.getString("name"));
        }

    }


    @Test
    public void delete() throws JSONException {

        try (OrientDbSession session = dbService.getSession("test")) {
            JSONObject o = session.save(DBApi2.EntityType.User.name(), new JSONObject("{\"name\":\"user\"}"));
            JSONObject result = session.find(DBApi2.EntityType.User.name(), o.getString("@rid"));
            Assert.assertEquals("user", result.getString("name"));
            session.delete(DBApi2.EntityType.User.name(), o.getString("@rid"));
            result = session.find(DBApi2.EntityType.User.name(), o.getString("@rid"));
            Assert.assertEquals(null, result);
        }

    }


}
