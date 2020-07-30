package de.ingrid.igeserver.exports.internal;

import com.fasterxml.jackson.databind.JsonNode;
import de.ingrid.igeserver.exports.ExportTypeInfo;
import de.ingrid.igeserver.exports.IgeExporter;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class InternalExporter implements IgeExporter {

    @Override
    public ExportTypeInfo getTypeInfo() {
        return new ExportTypeInfo("internal", "IGE", "Interne Datenstruktur des IGE");
    }

    @Override
    public Object run(JsonNode jsonData) throws IOException {
        // TODO: profile must be added to the exported format!
        return jsonData.toPrettyString();
    }

    @Override
    public String toString(Object exportedObject) {
        return (String) exportedObject;
    }
}
