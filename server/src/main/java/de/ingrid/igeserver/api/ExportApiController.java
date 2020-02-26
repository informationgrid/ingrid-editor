package de.ingrid.igeserver.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.model.ExportRequestParameter;
import de.ingrid.igeserver.services.DocumentService;
import de.ingrid.igeserver.services.ExportService;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.security.Principal;

@RestController
@RequestMapping(path = "/api")
public class ExportApiController implements ExportApi {

    @Autowired
    ExportService exportService;

    @Autowired
    DBApi dbService;

    @Autowired
    DocumentService documentService;

    @Autowired
    private DBUtils dbUtils;

    @Autowired
    private AuthUtils authUtils;

    public ResponseEntity<String> export(Principal principal, ExportRequestParameter data) throws Exception {

        String userId = this.authUtils.getUsernameFromPrincipal(principal);
        String dbId = this.dbUtils.getCurrentCatalogForUser(userId);
        String result;

        try (ODatabaseSession session = dbService.acquire(dbId)) {
            JsonNode doc = documentService.getByDocId(data.getId(), "mCloudDoc", true);
            result = exportService.doExport(doc, data.getProfile());
        }

        return ResponseEntity.ok(result);
    }

}
