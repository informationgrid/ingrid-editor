package de.ingrid.igeserver.db;

import com.orientechnologies.orient.core.Orient;
import com.orientechnologies.orient.core.db.*;
import com.orientechnologies.orient.core.iterator.ORecordIteratorClass;
import com.orientechnologies.orient.core.record.OElement;
import com.orientechnologies.orient.core.record.ORecordAbstract;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.executor.OResult;
import com.orientechnologies.orient.core.sql.executor.OResultSet;
import com.orientechnologies.orient.core.sql.query.OSQLSynchQuery;
import com.orientechnologies.orient.server.OServer;
import com.orientechnologies.orient.server.OServerMain;
import com.orientechnologies.orient.server.plugin.OServerPluginManager;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.documenttypes.DocumentType;
import de.ingrid.igeserver.exceptions.DatabaseDoesNotExistException;
import org.apache.commons.lang3.NotImplementedException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.validation.Configuration;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.*;

/**
 *
 */
@Service
public class OrientDBDatabase2 implements DBApi2 {

    private static Logger log = LogManager.getLogger(OrientDBDatabase2.class);
    private OServer server = null;


    /**
     * Initialize orient database with config file.
     *
     * @param dbConfigFile
     * @throws Exception
     */
    public void init(String dbConfigFile) throws Exception {
        String orientdbHome = new File("").getAbsolutePath();
        System.setProperty("ORIENTDB_HOME", orientdbHome);
        if (server == null) {
            server = OServerMain.create(true);
        }

        log.info("Starting OrientDB Server");
        server.startup(getClass().getResourceAsStream(dbConfigFile));
        OServerPluginManager manager = new OServerPluginManager();
        manager.config(server);
        server.activate();

        manager.startup();

        Orient.instance().startup();

    }


    @Override
    public void init() throws Exception {
        init("/db.config.xml");
    }

    @Override
    public void shutdown() {
        log.info("Shutdown database.");
        if (server != null) {
            server.shutdown();
        }
    }

    @Override
    public void createDatabase(String database, Map<String, Object> conf) {
        final ODatabaseType dbType;
        if (conf != null && conf.containsKey("dbType")) {
            String dbTypeStr = (String) conf.get("dbType");
            if (dbTypeStr.equals("PLOCAL")) {
                dbType = ODatabaseType.PLOCAL;
            } else {
                dbType = ODatabaseType.MEMORY;
            }
        } else {
            dbType = ODatabaseType.MEMORY;
        }

        server.createDatabase(database, dbType, OrientDBConfig.defaultConfig());

    }

    @Override
    public OrientDbSession getSession(String database) {
        return new OrientDbSession(server, database);
    }


}
