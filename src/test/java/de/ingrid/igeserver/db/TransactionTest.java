package de.ingrid.igeserver.db;

import com.orientechnologies.orient.core.db.*;
import com.orientechnologies.orient.core.iterator.ORecordIteratorClass;
import com.orientechnologies.orient.core.metadata.schema.OClass;
import com.orientechnologies.orient.core.record.OElement;
import com.orientechnologies.orient.core.record.impl.ODocument;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.junit.Assert.*;

public class TransactionTest {

    private static OrientDB db;

    @BeforeClass
    public static void before() {
        db = new OrientDB("memory:test", OrientDBConfig.defaultConfig());

        db.create("test", ODatabaseType.MEMORY);
        ODatabasePool pool = new ODatabasePool(db, "test", "admin", "admin");
        try (ODatabaseSession session = pool.acquire()) {
            session.newInstance("Person");
        }
        pool.close();
    }

    @Before
    public void cleanup() {
        try (ODatabaseSession session = getPool().acquire()) {
            for (ODocument person : session.browseClass("Person")) {
                session.delete(person);
            }
        }
    }

    @Test
    public void checkNormalInsert() {

        ODatabasePool pool = getPool();

        try (ODatabaseSession session = pool.acquire()) {
            OElement element = session.newElement("Person");
            element.setProperty("name", "John");
            element.save();
        }

        try (ODatabaseSession session = pool.acquire()) {
            long numPersons = session.countClass("Person");
            ORecordIteratorClass<ODocument> persons = session.browseClass("Person");

            ODocument person = persons.next();
            assertEquals(1, numPersons);
            assertEquals("John", person.field("name"));
        }

        pool.close();
    }

    @Test
    public void checkTransactionNoCommit() {
        ODatabasePool pool = getPool();

        try (ODatabaseSession session = pool.acquire()) {
            // begin transaction
            session.begin();
            OElement element = session.newElement("Person");
            element.setProperty("name", "John");
            element.save();
        }

        try (ODatabaseSession session = pool.acquire()) {
            long numPersons = session.countClass("Person");

            assertEquals(0, numPersons);
        }

        pool.close();
    }

    @Test
    public void checkTransactionWithCommit() {
        ODatabasePool pool = getPool();

        try (ODatabaseSession session = pool.acquire()) {
            // begin transaction
            session.begin();
            OElement element = session.newElement("Person");
            element.setProperty("name", "John");
            element.save();
            session.commit();
        }

        try (ODatabaseSession session = pool.acquire()) {
            long numPersons = session.countClass("Person");

            assertEquals(1, numPersons);
        }

        pool.close();
    }

    @Test
    public void checkParallelTransactions() throws InterruptedException {
        ODatabasePool pool = getPool();
        Thread otherThread;

        try (ODatabaseSession session = pool.acquire()) {
            // begin transaction
            session.begin();
            OElement element = session.newElement("Person");
            element.setProperty("name", "John");
            element.save();

            otherThread = new Thread(new Runnable(){
                public void run(){
                    System.out.println("Start other thread");
                    try (ODatabaseSession session2 = pool.acquire()) {
                        OElement element2 = session.newElement("Person");
                        element2.setProperty("name", "Mike");
                        element2.save();
                        System.out.println("Commit Session 2");
                        session2.commit();
                    }
                }
            });
            otherThread.start();

            // Thread.sleep(1000);
            System.out.println("Commit Session 1");
            session.commit();
        }

        // wait for other thread to be finished
        otherThread.join();

        try (ODatabaseSession session = pool.acquire()) {
            long numPersons = session.countClass("Person");

            assertEquals(2, numPersons);
        }

        pool.close();
    }

    private ODatabasePool getPool() {
        return new ODatabasePool(db, "test", "admin", "admin");
    }
}
