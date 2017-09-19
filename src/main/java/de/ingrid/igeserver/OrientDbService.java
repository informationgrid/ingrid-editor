package de.ingrid.igeserver;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.PreDestroy;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.metadata.sequence.OSequence;
import com.orientechnologies.orient.core.metadata.sequence.OSequence.SEQUENCE_TYPE;
import com.orientechnologies.orient.core.metadata.sequence.OSequenceLibrary;
import com.orientechnologies.orient.core.record.ORecordAbstract;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.query.OSQLSynchQuery;
import com.orientechnologies.orient.server.OServer;
import com.orientechnologies.orient.server.OServerMain;

@Service
public class OrientDbService {

    Logger log = LogManager.getLogger( OrientDbService.class );

    private OServer server = null;

    public OrientDbService() throws Exception {

        String orientdbHome = new File( "" ).getAbsolutePath(); // Set OrientDB home to current directory
        System.setProperty( "ORIENTDB_HOME", orientdbHome );

        server = OServerMain.create();
        server.startup( getClass().getResourceAsStream( "/db.config.xml" ) );
        server.activate();

        initDatabase();
    }

    public OServer getServer() {
        return server;
    }

    public void setServer(OServer server) {
        this.server = server;
    }

    public List<String> getAllFrom(String classType) {
        // log.info( "Thread is:" + Thread.currentThread().getName() );

        // TODO: should we get a new connection?
        // db.activateOnCurrentThread();
        ODatabaseDocumentTx db = openDB();
        List<String> list = new ArrayList<String>();

        try {
            for (ODocument item : db.browseClass( classType )) {
                list.add( item.toJSON() );
            }
        } finally {
            closeDB( db );
        }

        return list;
    }

    public String addDocTo(String classType, Object data) {
        return addDocTo( classType, data, null );
    }

    public String addDocTo(String classType, Object data, Object id) {
        ODatabaseDocumentTx db = openDB();
        String json = null;

        db.begin();

        try {

            ODocument doc = new ODocument( classType );
            doc.fromJSON( (String) data );

            if (id == null) {
                OSequence sequence = db.getMetadata().getSequenceLibrary().getSequence( "idseq" );
                doc.field( "_id", sequence.next() );
            } else {
                doc.field( "_id", id );
            }

            doc.save();

            json = doc.reload().toJSON();

            String parent = doc.field( "_parent", String.class );

            // update parent to tell that it has a child now, if it does not already have one
            if (parent != null) {
                ODocument parentDoc = getDocById( db, classType, parent );
                Boolean hasChildren = parentDoc.field( "_hasChildren", Boolean.class );
                if (hasChildren == null || hasChildren == false) {
                    parentDoc.field( "_hasChildren", true );
                    parentDoc.save();
                }
            }

            db.commit();
        } catch (Exception e) {
            log.error( "Could not add document", e );
            db.rollback();
        } finally {
            closeDB( db );
        }

        return json;
    }

    public String addOrUpdateDocTo(String classType, String data) {
        String storedDoc = null;
        ODocument doc = new ODocument( classType );
        doc.fromJSON( (String) data );

        String id = doc.field( "_id", String.class );

        ODatabaseDocumentTx db = openDB();
        ODocument docById = getDocById( db, classType, id );
        closeDB( db );

        if (docById == null) {
            if (id == null) {
                storedDoc = addDocTo( classType, data );

            } else {
                storedDoc = addDocTo( classType, data, id );

            }
        } else {
            storedDoc = updateDocTo( classType, id, data );
        }

        return storedDoc;
    }

    public List<String> find(String classType) {
        ODatabaseDocumentTx db = openDB();

        OSQLSynchQuery<ODocument> query = new OSQLSynchQuery<ODocument>(
                "SELECT * FROM " + classType );

        List<String> list = new ArrayList<String>();
        List<ODocument> docs = db.query( query );
        for (ODocument doc : docs) {
            list.add( prepare( doc ).toJSON() );
        }

        closeDB( db );
        return list;
    }

    public String getById(String classType, String id) {
        ODatabaseDocumentTx db = openDB();
        String json = null;

        try {
            OSQLSynchQuery<ODocument> query = new OSQLSynchQuery<ODocument>(
                    "SELECT * FROM " + classType + " WHERE _id = " + id );

            List<ODocument> result = db.query( query );

            if (result.size() == 1) {
                json = prepare( result.get( 0 ) ).toJSON();
            }

        } finally {
            closeDB( db );
        }
        return json;
    }

    public String updateDocTo(String classType, String id, String data) {
        ODatabaseDocumentTx db = openDB();

        // String docToUpdate = getById( classType, id );

        ODocument docToUpdate = getDocById( db, classType, id );

        docToUpdate.fromJSON( (String) data );
        docToUpdate.save();

        String json = docToUpdate.reload().toJSON();
        closeDB( db );

        return json;
    }

    public List<String> getPathToDataset(String id) {
        ODatabaseDocumentTx db = openDB();

        ODocument doc = getDocById( db, "Documents", id );
        String parent = doc.field( "_parent", String.class );

        if (parent == null) {
            List<String> initialList = new ArrayList<String>();
            initialList.add( id );
            return initialList;
        } else {
            List<String> path = getPathToDataset( parent );
            path.add( id );

            return path;
        }
    }

    public List<String> getChildDocuments(String parentId) {
        List<String> list = new ArrayList<String>();
        ODatabaseDocumentTx db = openDB();

        try {

            String queryStr = null;

            if (parentId == null) {
                queryStr = "SELECT * FROM Documents WHERE _parent IS NULL";
            } else {
                queryStr = "SELECT * FROM Documents WHERE _parent = " + parentId;
            }

            OSQLSynchQuery<ODocument> query = new OSQLSynchQuery<ODocument>( queryStr );

            List<ODocument> result = db.query( query );

            result.forEach( doc -> {
                list.add( prepare( doc ).toJSON() );
            } );

        } finally {
            closeDB( db );
        }
        return list;
    }
    
    public String getDocStatistic() {
        ODatabaseDocumentTx db = openDB();
        
        String queryStr = "select _profile, count(_profile) from Documents group by _profile";
        OSQLSynchQuery<ODocument> query = new OSQLSynchQuery<ODocument>( queryStr );
        List<ODocument> result = db.query( query );
        
        ODocument resDoc = new ODocument();
        result.forEach( row -> {
            resDoc.field( row.field( "_profile" ), (Integer)row.field( "count", Integer.class ) );
        });
        
        closeDB( db );
        
        return resDoc.toJSON();
    }
    
    public void deleteDocFrom(String classType, String id) {
        ODatabaseDocumentTx db = openDB();
        
        // get document first to get the identifier
        ODocument doc = getDocById( db, classType, id );
        
        // delete record by their identifier
        db.delete( doc.getIdentity() );
        
        closeDB( db );
    }


    /**
     * PRIVATE METHODS
     * 
     * @param db
     */

    private ODocument getDocById(ODatabaseDocumentTx db, String classType, String id) {
        OSQLSynchQuery<ODocument> query = new OSQLSynchQuery<ODocument>(
                "SELECT * FROM " + classType + " WHERE _id = '" + id + "'" );

        List<ODocument> result = db.query( query );
        if (result.size() == 0) {
            return null;
        } else if (result.size() == 1) {
            return result.get( 0 );
        } else {
            log.error( "There's more than 1 document with this ID: " + classType + ":" + id );
            throw new RuntimeException( "Non unique ID or multiple" );
        }
    }

    private ORecordAbstract prepare(ODocument doc) {
        // doc.field( "_id", doc.getIdentity() );
        doc.field( "_state", "W" );
        return doc;
    }

    private ODatabaseDocumentTx openDB() {
        ODatabaseDocumentTx db = new ODatabaseDocumentTx( "plocal:./databases/igedb" );
        db.open( "admin", "admin" );
        return db;
    }

    private void closeDB(ODatabaseDocumentTx db) {
        db.close();
    }

    @PreDestroy
    private void destroy() {
        // db.close();
        server.shutdown();
    }

    private void initDatabase() {
        try {
            ODatabaseDocumentTx db = new ODatabaseDocumentTx( "plocal:./databases/igedb" );

            // db.begin();
            // db.isClosed();

            // add database if it does not exist
            if (!db.exists()) {
                db.create();

                // add schema
                OClass docClass = db.getMetadata().getSchema().createClass( "Documents" );
                docClass.createProperty( "_id", OType.INTEGER );
                docClass.createProperty( "_parent", OType.INTEGER );
                docClass.createIndex( "idIdx", OClass.INDEX_TYPE.UNIQUE, "_id" );

                OClass behaviourClass = db.getMetadata().getSchema().createClass( "Behaviours" );
                behaviourClass.createProperty( "_id", OType.STRING );
                behaviourClass.createIndex( "idIdx", OClass.INDEX_TYPE.UNIQUE, "_id" );
                
                OClass userClass = db.getMetadata().getSchema().createClass( "Users" );
                OClass roleClass = db.getMetadata().getSchema().createClass( "Roles" );

                OSequenceLibrary sequenceLibrary = db.getMetadata().getSequenceLibrary();
                if (sequenceLibrary.getSequence( "idseq" ) == null) {
                    OSequence seq = sequenceLibrary.createSequence( "idseq", SEQUENCE_TYPE.ORDERED, new OSequence.CreateParams().setStart( 0l ).setIncrement( 1 ) );
                    seq.save();

                    // TODO: CREATE INDEX items.ID ON items (ID) UNIQUE
                }
            }

            // db.command( new OCommandSQL( "DROP CLASS Documents" ) ).execute();

            // db.newInstance( "Behaviours" ).save();
            // ODocument doc = db.newInstance( "Documents" );
            // doc.fromJSON( "{ \"title\": \"my doc\", \"_profile\": \"UVP\" }" );
            // doc.save();
            // db.newInstance( "Roles" ).save();
            // db.newInstance( "Users" ).save();

            // ODocument doc = db.newInstance( "Behaviours" );
            // add an example record
            // ODocument iRecord = new ODocument("Behaviours");
            // iRecord.fromJSON( "{ \"name\": \"Peter\", \"age\": 34 }" );
            // iRecord.save();
            // db.commit();
            // db.close();
        } catch (Exception e) {
            log.error( "Error during DB initialization", e );
        } finally {}
    }

}
