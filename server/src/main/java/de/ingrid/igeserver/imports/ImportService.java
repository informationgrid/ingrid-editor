package de.ingrid.igeserver.imports;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class ImportService {

    private static Logger log = LogManager.getLogger(ImportService.class);

    public String determineImportFormat(String fileType, String fileContent) {


         /*
            XML  => text/xml
            TEXT => application/octet-stream
            JSON => application/json
            ZIP  => application/x-zip-compressed
        */


        log.info("Type: " + fileType);

        return "???";

    }
}
