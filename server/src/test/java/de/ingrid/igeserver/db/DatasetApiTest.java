package de.ingrid.igeserver.db;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.db.OrientDB;
import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.api.DatasetsApiController;
import de.ingrid.igeserver.services.DocumentService;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.mockito.*;

import java.io.IOException;
import java.util.HashSet;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Matchers.any;

public class DatasetApiTest {

    private static OrientDB db;
    @Mock
    private AuthUtils authUtils;

    @Mock
    private DBUtils dbUtils;

    @Spy
    private DBApi dbService;

    @Mock
    private DocumentService documentService;

    @BeforeClass
    public static void before() {

        /*db = new OrientDB("memory:test", OrientDBConfig.defaultConfig());

        db.create("test", ODatabaseType.MEMORY);

        ODatabaseSession testDB = db.open("test", "admin", "admin");

        testDB.getMetadata().getSchema().createClass("Documents");
        testDB.commit();

        OrientDBDatabase orientDBDatabase = new OrientDBDatabase();
        orientDBDatabase.*/
    }

    @Before
    public void prepare() throws ApiException {
        MockitoAnnotations.initMocks(this);
        Mockito.when(authUtils.getUsernameFromPrincipal(any())).thenReturn("user1");
        HashSet<String> dbIds = new HashSet<>();
        dbIds.add("test");

        //dbUtils = new DBUtils(dbService);
        Mockito.when(dbUtils.getCatalogsForUser("user1")).thenReturn(dbIds);

    }

    @Test
    public void createDataset() throws ApiException, IOException {

        DatasetsApiController controller = new DatasetsApiController(authUtils, dbUtils, dbService, documentService);

        //language=JSON
        String data = "{\"title\": \"Document 1\"}";
        controller.createDataset(null, data, false, false);

        // ASSERTIONS
        ArgumentCaptor<String> arg = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> arg2 = ArgumentCaptor.forClass(String.class);

        Mockito.verify(dbService).save(eq("Documents"), any(), arg.capture());
        ObjectNode jsonNode = (ObjectNode) new ObjectMapper().readTree(arg.getValue());
        assertTrue(jsonNode.get("_id").asText().length() > 0);
        jsonNode.remove("_id");
        assertEquals("{\n" +
                "  \"uuid\": \"123\",\n" +
                "  \"title\": \"Document 1\"\n" +
                "}", jsonNode.toString());

        Mockito.verify(dbService).save(eq("DocumentWrapper"), any(), arg2.capture());
        ObjectNode jsonNode2 = (ObjectNode) new ObjectMapper().readTree(arg.getValue());
        assertTrue(jsonNode2.get("_id").asText().length() > 0);
        jsonNode2.remove("_id");
        assertEquals("{\n" +
                "  \"_id\": \"2\",\n" +
                "  \"_parent\": null,\n" +
                "  \"_hasChildren\":false,\n" +
                "  \"draft\": \"123\",\n" +
                "  \"published\": null,\n" +
                "  \"archive\": []\n" +
                "}", jsonNode2.toString());


    }
}
