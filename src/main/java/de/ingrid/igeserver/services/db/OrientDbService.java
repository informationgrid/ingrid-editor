package de.ingrid.igeserver.services.db;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PreDestroy;

import com.orientechnologies.orient.core.Orient;
import com.orientechnologies.orient.core.db.ODefaultEmbeddedDatabaseInstanceFactory;
import com.orientechnologies.orient.core.db.OEmbeddedDatabaseInstanceFactory;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import com.orientechnologies.orient.client.remote.OServerAdmin;
import com.orientechnologies.orient.core.db.OPartitionedDatabasePool;
import com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx;
import com.orientechnologies.orient.core.id.ORecordId;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.metadata.schema.OType;
import com.orientechnologies.orient.core.metadata.sequence.OSequence;
import com.orientechnologies.orient.core.metadata.sequence.OSequence.SEQUENCE_TYPE;
import com.orientechnologies.orient.core.metadata.sequence.OSequenceLibrary;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.query.OSQLSynchQuery;
import com.orientechnologies.orient.server.OServer;
import com.orientechnologies.orient.server.OServerMain;

// @Service
public class OrientDbService {
    
    // TODO: optimize server: https://github.com/orientechnologies/orientdb/issues/6922

    private static Logger log = LogManager.getLogger( OrientDbService.class );

    private OServer server = null;
    
    private static HashMap<String, OPartitionedDatabasePool> poolMap = new HashMap<>();

    public OrientDbService() throws Exception {

        log.info("Init DB Service");

        String orientdbHome = new File( "" ).getAbsolutePath(); // Set OrientDB home to current directory
        System.setProperty( "ORIENTDB_HOME", orientdbHome );

        server = OServerMain.create();
        server.startup( getClass().getResourceAsStream( "/db.config.xml" ) );
        server.activate();

        initSystemDBs();
        initDatabase("igedb");
    }

    @PreDestroy
    private void shutdown() {
        server.shutdown();
    }

    public OServer getServer() {
        return server;
    }

    public void setServer(OServer server) {
        this.server = server;
    }
    
    public void createDatabase(String name) {
        initDatabase(name);
    }

    public List<String> getAllFrom(String classType) {
        // log.info( "Thread is:" + Thread.currentThread().getName() );

        // TODO: should we get a new connection?
        // db.activateOnCurrentThread();
        ODatabaseDocumentTx db = openDB("igedb");
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
        return addDocTo( "igedb", classType, data, id );
    }
    
    public String addDocTo(String dbId, String classType, Object data, Object id) {
        ODatabaseDocumentTx db = openDB(dbId);
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

        ODatabaseDocumentTx db = openDB("igedb");
        ODocument docById = getDocById( db, classType, id );
        closeDB( db );

        if (docById == null) {
            if (id == null) {
                storedDoc = addDocTo( classType, data );

            } else {
                storedDoc = addDocTo( classType, data, id );

            }
        } else {
            storedDoc = updateDocTo( "igedb", classType, id, data );
        }

        return storedDoc;
    }

    public List<String> find(String dbName, String classType, Map<String, String> query, String... fields) {
        ODatabaseDocumentTx db = openDB(dbName);

        OSQLSynchQuery<ODocument> oQuery;
        if (query == null) {
            oQuery = new OSQLSynchQuery<ODocument>("SELECT * FROM " + classType );
        } else {
            // select * from `Documents` where (draft.firstName like "%er%" or draft.lastName like "%es%")
            // TODO: try to use lucene index!
            List<String> where = new ArrayList<String>();
            for (String key : query.keySet()) {
                String value = query.get( key );
                if (value == null) {
                    where.add( key + ".toLowerCase() IS NULL" );
                } else {
                    where.add( key + ".toLowerCase() like '%"+ value.toLowerCase() +"%'" );
                }
            }
            oQuery = new OSQLSynchQuery<ODocument>("SELECT * FROM " + classType + " WHERE (" + String.join( " or ", where ) + ")");
        }
        
        List<String> list = new ArrayList<String>();
        List<ODocument> docs = db.query( oQuery );
        for (ODocument doc : docs) {
            if (fields == null) {
                list.add( doc.toJSON() );
            } else {
                // TODO: fix fields!
                String field = fields[0];
                Object docField = doc.field( field );
                list.add( docField instanceof Integer ? String.valueOf( docField ) : (String) docField );
            }
        }

        closeDB( db );
        return list;
    }

    public String getById(String classType, String id) {
        ODatabaseDocumentTx db = openDB("igedb");
        String json = null;

        try {
            OSQLSynchQuery<ODocument> query = new OSQLSynchQuery<ODocument>(
                    "SELECT * FROM " + classType + " WHERE _id = " + id );

            List<ODocument> result = db.query( query );

            if (result.size() == 1) {
                json = result.get( 0 ).toJSON();
            }

        } finally {
            closeDB( db );
        }
        return json;
    }

    public String updateDocTo(String dbName, String classType, String id, String data) {
        ODatabaseDocumentTx db = openDB(dbName);

        // String docToUpdate = getById( classType, id );

        ODocument docToUpdate = getDocById( db, classType, id );

        docToUpdate.fromJSON( (String) data );
        docToUpdate.save();

        String json = docToUpdate.reload().toJSON();
        closeDB( db );

        return json;
    }

    public List<String> getPathToDataset(String id) {
        ODatabaseDocumentTx db = openDB("igedb");

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
        ODatabaseDocumentTx db = openDB("igedb");

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
                list.add( doc.toJSON() );
            } );

        } finally {
            closeDB( db );
        }
        return list;
    }
    
    public String getDocStatistic() {
        ODatabaseDocumentTx db = openDB("igedb");
        
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
        ODatabaseDocumentTx db = openDB("igedb");
        
        // get document first to get the identifier
        ODocument doc = getDocById( db, classType, id );
        
        String parent = doc.field( "_parent", String.class );
        
        // delete record by their identifier
        db.delete( doc.getIdentity() );
        
        closeDB( db );
        
        
        // update parent if it still has any children
        Map<String, String> query = new HashMap<String, String>();
        query.put( "_parent", parent );
        List<String> childDocs = find( "igedb", classType, query, "_id" );
        
        if (childDocs.size() == 0) {
            db = openDB("igedb");
            ODocument parentDoc = getDocById( db, classType, parent );
            parentDoc.field( "_hasChildren", false );
            parentDoc.save();
            closeDB( db );
        }
        
    }
    
    public void deleteRawDoc(String classType, String dbIdentifier) {
        ODatabaseDocumentTx db = openDB("igedb");
        
        db.delete( new ORecordId( dbIdentifier ) );
        
        closeDB( db );
    }
    
    public void addRawDocTo(String dbId, String classType, Object id, String field, Object data) {
        ODatabaseDocumentTx db = openDB(dbId);
        db.begin();
        
        ODocument doc = new ODocument( classType );
        doc.field( field, data );
        doc.save();
        
        db.commit();
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

    /**
     * We should use beginTransaction and get the db document from there, with which we can close the connection again.
     * @param databaseName
     * @return
     */
    @Deprecated
    private ODatabaseDocumentTx openDB(String databaseName) {
        return getDatabasePool( "plocal:./databases/" + databaseName ).acquire();
    }

    private void closeDB(ODatabaseDocumentTx db) {
        db.close();
    }

    /**
     * Get a database pool for a specific connection. If this pool does not exist yet
     * then create a new pool for this connection.
     * @param url is the name for the connection to the db to get the pool from
     * @return a pool for a given connection
     */
    private OPartitionedDatabasePool getDatabasePool(String url) {
        if (poolMap.containsKey( url )) {
            return poolMap.get( url );
        } else {
            OPartitionedDatabasePool pool = new OPartitionedDatabasePool(url , "admin", "admin");
            ODefaultEmbeddedDatabaseInstanceFactory embDBFactory = new ODefaultEmbeddedDatabaseInstanceFactory();
            poolMap.put( url, pool );
            return pool;
        }
    }

    @PreDestroy
    private void destroy() {
        // db.close();
        server.shutdown();
    }

    

    private void initSystemDBs() {
        ODatabaseDocumentTx db = new ODatabaseDocumentTx( "plocal:./databases/management" );
        if (!db.exists()) {
            db.create();
            
            OSequenceLibrary sequenceLibrary = db.getMetadata().getSequenceLibrary();
            OSequence seq = sequenceLibrary.createSequence( "idseq", SEQUENCE_TYPE.ORDERED, new OSequence.CreateParams().setStart( 0l ).setIncrement( 1 ) );
            seq.save();
            
            db.getMetadata().getSchema().createClass( "info" );
            //addDocTo( "management", "Connections", "{ 'id': 'ige', 'catalogId': 'igedb' }", null );
            
            OClass catalogClass = db.getMetadata().getSchema().createClass( "Catalogs" );
            catalogClass.createProperty( "_id", OType.INTEGER );
            catalogClass.createIndex( "iidIdx", OClass.INDEX_TYPE.UNIQUE, "_id" );
            
        }
        db.close();

        db = new ODatabaseDocumentTx( "plocal:./databases/users" );
        if (!db.exists()) {
            db.create();

            OSequenceLibrary sequenceLibrary = db.getMetadata().getSequenceLibrary();
            OSequence seq = sequenceLibrary.createSequence( "idUserSeq", SEQUENCE_TYPE.ORDERED, new OSequence.CreateParams().setStart( 0l ).setIncrement( 1 ) );
            seq.save();

            db.getMetadata().getSchema().createClass( "info" );
//            addDocTo( "users", "info", "{ 'id': 'ige', 'catalogId': 'igedb' }", null );
        }
        db.close();
    }
    
    private void initDatabase(String databaseName) {
        Orient.instance().startup();
        try {
            ODatabaseDocumentTx db = new ODatabaseDocumentTx( "plocal:./databases/" + databaseName );

            // db.begin();
            // db.isClosed();

            // add database if it does not exist
            if (!db.exists()) {
                db.create();

                // add schema
                OClass docClass = db.getMetadata().getSchema().createClass( "Documents" );
                docClass.createProperty( "_id", OType.INTEGER );
                docClass.createProperty( "_parent", OType.INTEGER );
                docClass.createIndex( "didIdx", OClass.INDEX_TYPE.UNIQUE, "_id" );
                
                OClass behaviourClass = db.getMetadata().getSchema().createClass( "Behaviours" );
                behaviourClass.createProperty( "_id", OType.STRING );
                behaviourClass.createIndex( "bidIdx", OClass.INDEX_TYPE.UNIQUE, "_id" );
                
                db.getMetadata().getSchema().createClass( "Users" );
                db.getMetadata().getSchema().createClass( "Roles" );

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
             db.close();
        } catch (Exception e) {
            log.error( "Error during DB initialization", e );
        } finally {}
    }

	public Object beginTransaction(String databaseName) {
	    
	    // use Database Pools: https://orientdb.com/docs/2.2/Document-API-Database.html#using-database-pools
	    OPartitionedDatabasePool pool =  new OPartitionedDatabasePool("plocal:./databases/" + databaseName , "admin", "admin");
	    
	    ODatabaseDocumentTx db = pool.acquire();
        db.begin();
        return db;
	}

	public void commit(Object transaction) {
	    ((ODatabaseDocumentTx)transaction).commit();
	}

	public void rollback(Object transaction) {
	    ((ODatabaseDocumentTx)transaction).rollback();
	}

    public String[] getDatabases() {
        OServerAdmin oServerAdmin;
        try {
            oServerAdmin = new OServerAdmin( "remote:localhost" );
            oServerAdmin.connect( "root", "root" );
            return oServerAdmin.listDatabases().keySet().toArray( new String[0] );
        } catch (Exception e) {
            log.error( "Error connecting to OrientDB server to get all databases.", e );
        }
        return null;
        
    }
}
