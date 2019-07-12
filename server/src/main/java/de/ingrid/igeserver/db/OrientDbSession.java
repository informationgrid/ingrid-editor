package de.ingrid.igeserver.db;

import com.orientechnologies.orient.core.db.ODatabaseSession;
import com.orientechnologies.orient.core.id.ORecordId;
import com.orientechnologies.orient.core.record.ORecord;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.executor.OResultSet;
import com.orientechnologies.orient.server.OServer;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class OrientDbSession implements DbSession {

    private OServer server = null;
    private ODatabaseSession db = null;
    private String databaseName = null;


    public OrientDbSession(OServer server, String databaseName) {
        this.server = server;
        this.databaseName = databaseName;

        if (!server.existsDatabase(databaseName)) {
            throw new RuntimeException("Database does not exist: " + databaseName);
        }

        db = server.openDatabase(databaseName);
    }

    @Override
    public Iterator<JSONObject> findAll(String entity) throws JSONException {

        return new ResultIteratorJSON(db.browseClass(entity));

    }

    @Override
    public JSONObject find(String entity, String id) throws JSONException {
        String query = "SELECT * FROM " + entity + " WHERE @rid = " + id;
        JSONObject result = null;
        OResultSet resultSet = db.query(query);
        if (resultSet.hasNext()) {
            result = new JSONObject(resultSet.next().toJSON());
            result.put(ID_FIELD, result.getString("@rid"));
            if (resultSet.hasNext()) {
                throw new RuntimeException("Duplicate documents for ID:" + id + "@" + entity);
            }
        }
        return result;
    }

    @Override
    public JSONObject save(String entity, JSONObject o) throws JSONException {

        ODocument doc = new ODocument(entity);
        doc.fromJSON(o.toString());
        return new JSONObject(db.save(doc).toJSON());
    }

    @Override
    public void delete(String entity, String id) {
        String query = "SELECT * FROM " + entity + " WHERE @rid = " + id;
        JSONObject result = null;
        OResultSet resultSet = db.query(query);
        while (resultSet.hasNext()) {
            db.delete(resultSet.next().getRecord().get());
        }
    }

    @Override
    public void close() {
        db.close();
    }

    @Override
    public void begin() {
        db.begin();
    }

    @Override
    public void commit() {
        db.commit();
    }

    @Override
    public void rollback() {
        db.rollback();
    }


    private class ResultIteratorJSON implements Iterator<JSONObject> {

        Iterator<ODocument> it;

        public ResultIteratorJSON(Iterator<ODocument> it) {
            this.it = it;
        }

        @Override
        public boolean hasNext() {
            return this.it.hasNext();
        }

        @Override
        public JSONObject next() {
            ODocument o = this.it.next();
            try {
                JSONObject result = new JSONObject(o.toJSON());
                result.put(ID_FIELD, result.getString("@rid"));
                return result;
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        }
    }


}
