package de.ingrid.igeserver.profiles.mcloud.exporter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mitchellbosecke.pebble.PebbleEngine;
import com.mitchellbosecke.pebble.template.PebbleTemplate;
import de.ingrid.igeserver.exports.ExportTypeInfo;
import de.ingrid.igeserver.exports.IgeExporter;
import de.ingrid.igeserver.services.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;

@Service
@Profile("mcloud")
public class PortalExporter implements IgeExporter {

    @Autowired
    DocumentService documentService;


    @Override
    public ExportTypeInfo getTypeInfo() {
        return new ExportTypeInfo(
                "portal",
                "mCLOUD Portal",
                "Export der Daten für die weitere Verwendung im Liferay Portal und Exporter.");
    }

    @Override
    public Object run(JsonNode jsonData) throws IOException {
        PebbleEngine engine = new PebbleEngine.Builder()
                .newLineTrimming(false)
                .build();

        PebbleTemplate compiledTemplate = engine.getTemplate("templates/export/mcloud/portal.peb");

        Writer writer = new StringWriter();

        Map<String, Object> map = getMapFromObject(jsonData);
        compiledTemplate.evaluate(writer, map);

        return writer.toString().replaceAll("\\s+\n", "\n");
    }

    @Override
    public String toString(Object exportedObject) {
        return exportedObject.toString();
    }

    private Map<String, Object> getMapFromObject(Object object) {
        ObjectMapper mapper = new ObjectMapper();
        // return mapper.valueToTree(object);
        try {
            if (object instanceof String) {
                return mapper.readValue((String) object, HashMap.class);
            } else {
                return  mapper.convertValue(object, HashMap.class);
            }
        } catch (IOException e) {
            // log.error(e);
            return null;
        }
    }
}
