package de.ingrid.igeserver.exports;

import com.mitchellbosecke.pebble.PebbleEngine;
import com.mitchellbosecke.pebble.template.PebbleTemplate;
import org.junit.Test;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;

public class IsoExport {

    @Test
    public void normalExport() throws IOException {
        PebbleEngine engine = new PebbleEngine.Builder().build();
        PebbleTemplate compiledTemplate = engine.getTemplate("templates/iso-base.xml");

        Writer writer = new StringWriter();



        compiledTemplate.evaluate(writer, createContext());

        String output = writer.toString();
        System.out.println(output);
    }

    private Map<String, Object> createContext() {
        Map<String, Object> context = new HashMap<>();
        context.put("fileIdentifier", "123456789");
        context.put("hierarchyLevel", "dataset");
        return context;
    }
}
