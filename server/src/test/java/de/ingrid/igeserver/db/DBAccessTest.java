package de.ingrid.igeserver.db;

import com.orientechnologies.orient.core.db.*;
import com.orientechnologies.orient.core.record.OElement;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

public class DBAccessTest {

    private static OrientDB db;

    @BeforeClass
    public static void before() {
        db = new OrientDB("memory:test", OrientDBConfig.defaultConfig());

        db.create("test", ODatabaseType.MEMORY);
    }

    @Test
    public void getDBConnectionsFromPool() {

        OrientDBConfigBuilder orientDBConfigBuilder = new OrientDBConfigBuilder();
        ODatabasePool pool = new ODatabasePool(db, "test", "admin", "admin");

        ODatabaseDocumentInternal internal = ODatabaseRecordThreadLocal.instance().get();

        ODatabaseSession session1 = pool.acquire();

        internal = ODatabaseRecordThreadLocal.instance().get();

        assertEquals(session1.hashCode(), internal.hashCode());

        ODatabaseSession session2 = pool.acquire();
        ODatabaseDocumentInternal internalAfter = ODatabaseRecordThreadLocal.instance().get();

        assertNotEquals(session1.hashCode(), session2.hashCode());
        assertNotEquals(internalAfter.hashCode(), internal.hashCode());

        pool.close();
    }

    @Test
    public void getDBConnectionsFromPoolAndClose() {

        ODatabasePool pool = new ODatabasePool(db, "test", "admin", "admin");

        ODatabaseSession session1 = pool.acquire();
        session1.close();
        ODatabaseSession session2 = pool.acquire();

        assertEquals(session1.hashCode(), session2.hashCode());

        pool.close();
    }

    @Test
    public void getDBConnectionsFromMultipleThreads() throws InterruptedException {

        ODatabasePool pool = new ODatabasePool(db, "test", "admin", "admin");

        Thread t1 = new Thread( ()-> {
            try (ODatabaseSession session = pool.acquire()) {
                System.out.println("DB thread 1 is: " + ODatabaseRecordThreadLocal.instance().get().hashCode());
            }
        });
        t1.start();

        Thread t2 = new Thread( ()-> {
            try (ODatabaseSession session = pool.acquire()) {
                System.out.println("DB thread 2 is: " + ODatabaseRecordThreadLocal.instance().get().hashCode());
            }
        });
        t2.start();

//        assertEquals(session1.hashCode(), session2.hashCode());

        t1.join();
        t2.join();
        pool.close();
    }
}
