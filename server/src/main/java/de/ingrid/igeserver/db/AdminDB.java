package de.ingrid.igeserver.db;

import com.orientechnologies.orient.core.db.ODatabaseDocumentInternal;
import com.orientechnologies.orient.core.db.OrientDB;
import com.orientechnologies.orient.server.OServer;

public class AdminDB {

    OServer db;

    public void createClass(String dbName, String name) {
        boolean alreadyExists = db.existsDatabase(dbName);
        ODatabaseDocumentInternal session = db.openDatabase(name);
        session.getMetadata().getSchema().createClass("Addresses");
    }
}
