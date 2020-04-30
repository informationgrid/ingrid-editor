package de.ingrid.igeserver.imports;

import com.fasterxml.jackson.databind.JsonNode;
import de.ingrid.ige.api.IgeImporter;
import org.springframework.stereotype.Service;

@Service
public class IgeImporterDummy implements IgeImporter {
    @Override
    public JsonNode run(Object data) {
        return null;
    }

    @Override
    public boolean canHandleImportFile(String contentType, String fileContent) {
        return false;
    }

    @Override
    public String getName() {
        return null;
    }
}
