package de.ingrid.igeserver.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.db.ODatabaseSession;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.documenttypes.AddressWrapperType;
import de.ingrid.igeserver.exports.ExportTypeInfo;
import de.ingrid.igeserver.model.ExportRequestParameter;
import de.ingrid.igeserver.services.DocumentService;
import de.ingrid.igeserver.services.ExportService;
import de.ingrid.igeserver.services.MapperService;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

import static de.ingrid.igeserver.documenttypes.DocumentWrapperType.TYPE;

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
        String type = forAddress ? AddressWrapperType.TYPE : TYPE;

        String result;

        try (ODatabaseSession ignored = dbService.acquire(dbId)) {
            JsonNode doc = documentService.getByDocId(data.getId(), type, true);

            JsonNode docVersion = null;
            if (data.isUseDraft()) {
                docVersion = doc.get(MapperService.FIELD_DRAFT);
            }

            if (docVersion == null) {
                docVersion = doc.get(MapperService.FIELD_PUBLISHED);
            }

            documentService.removeDBManagementFields((ObjectNode) docVersion);

            result = exportService.doExport(docVersion, data.getExportFormat());
        }

        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<List<ExportTypeInfo>> exportTypes(Principal principal, String sourceCatalogType) throws Exception {
        return ResponseEntity.ok(exportService.getExportTypes());
    }

}
