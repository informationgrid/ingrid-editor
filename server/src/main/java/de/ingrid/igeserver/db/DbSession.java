package de.ingrid.igeserver.db;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import java.io.Closeable;
import java.util.Iterator;

public interface DbSession extends Closeable {

    public static final String ID_FIELD = "_id";

    public Iterator<JSONObject> findAll(String type) throws JSONException;

    public JSONObject find(String type, String id) throws JSONException;

    public JSONObject save(String type, JSONObject o) throws JSONException;

    public void delete(String type, String id);


    public void begin();

    public void commit();

    public void rollback();
}
