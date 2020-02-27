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

import java.security.Principal;

import static de.ingrid.igeserver.documenttypes.DocumentWrapperType.ADDRESS_WRAPPER;
import static de.ingrid.igeserver.documenttypes.DocumentWrapperType.DOCUMENT_WRAPPER;

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

        // TODO: option to export addresses too?
        boolean forAddress = false;
        String type = forAddress ? ADDRESS_WRAPPER : DOCUMENT_WRAPPER;

        String result;

        try (ODatabaseSession ignored = dbService.acquire(dbId)) {
            JsonNode doc = documentService.getByDocId(data.getId(), type, true);

            result = exportService.doExport(doc, data.getExportFormat());
        }

        return ResponseEntity.ok(result);
    }

}
