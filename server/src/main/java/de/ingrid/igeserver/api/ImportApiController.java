package de.ingrid.igeserver.api;

import com.fasterxml.jackson.databind.JsonNode;
import de.ingrid.ige.api.IgeImporter;
import de.ingrid.igeserver.imports.ImportService;
import de.ingrid.igeserver.imports.ImporterFactory;
import de.ingrid.igeserver.model.ImportAnalyzeInfo;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.Charset;

@RestController
@RequestMapping(path = "/api")
public class ImportApiController implements ImportApi {

    private static Logger log = LogManager.getLogger(ImportApiController.class);

    private final ImportService importService;

    @Autowired
    ImporterFactory factory;

    @Autowired
    public ImportApiController(ImportService importService) {
        this.importService = importService;
    }

    public ResponseEntity<ImportAnalyzeInfo> importDataset(MultipartFile file) throws IOException, ApiException {

        String type = file.getContentType();

        String fileContent = new String(file.getBytes(), Charset.defaultCharset());

        IgeImporter importer = factory.getImporter(type, fileContent);
        JsonNode result = importer.run(fileContent);

        ImportAnalyzeInfo info = new ImportAnalyzeInfo();
        info.setImportType(importer.getName());
        info.setNumDocuments(1);
        info.setResult(result);
        return ResponseEntity.ok(info);
    }

}
