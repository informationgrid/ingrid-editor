package de.ingrid.igeserver.exports.iso19115;

import com.fasterxml.jackson.databind.JsonNode;
import com.mitchellbosecke.pebble.PebbleEngine;
import com.mitchellbosecke.pebble.template.PebbleTemplate;
import de.ingrid.igeserver.exports.ExportTypeInfo;
import de.ingrid.igeserver.exports.IgeExporter;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.*;

@Service
public class Iso19115Exporter implements IgeExporter {

    private final ExportTypeInfo info;

    public Iso19115Exporter() {
        info = new ExportTypeInfo("iso19115", "ISO-19115", "Export in das ISO-19115 Format");
    }

    @Override
    public ExportTypeInfo getTypeInfo() {
        return info;
    }

    @Override
    public Object run(JsonNode jsonData) throws IOException {
        PebbleEngine engine = new PebbleEngine.Builder()
                .newLineTrimming(false)
                .build();

        PebbleTemplate compiledTemplate = engine.getTemplate("templates/export/iso/iso-base.peb");

        Writer writer = new StringWriter();

        compiledTemplate.evaluate(writer, createContext(jsonData));

        return writer.toString().replaceAll("\\s+\n", "\n");
    }

    @Override
    public String toString(Object exportedObject) {
        return null;
    }

    private Map<String, Object> createContext(JsonNode json) {
        Map<String, Object> context = new HashMap<>();

        Iso iso = new Iso();
        iso.title = getStringOf(json, "title");
        iso.description = getStringOf(json, "description");
        iso.uuid = "123456789";
        iso.hierarchyLevel = "dataset";
        iso.modified = new Date();
        iso.useConstraints = getUseConstraints();
        iso.thesauruses = getKeywords(json);

        context.put("iso", iso);
        return context;
    }

    private List<Thesaurus> getKeywords(JsonNode json) {
        JsonNode keywordsNode = json.get("keywords");
        if (keywordsNode == null) {
            return null;
        }

        List<Thesaurus> thesauruses = new ArrayList<>();
        List<Keyword> keywords = new ArrayList<>();

        Iterator<JsonNode> keywordsIterator = keywordsNode.iterator();
        while (keywordsIterator.hasNext()) {
            JsonNode next = keywordsIterator.next();
            Keyword keyword = new Keyword(getStringOf(next, "name"), getStringOf(next, "link"));
            keywords.add(keyword);
        }

        Thesaurus thesaurus = new Thesaurus("Mein Thesaurus", "10.10.1978", keywords);
        thesauruses.add(thesaurus);

        return thesauruses;
    }

    private List<UseConstraint> getUseConstraints() {
        List<UseConstraint> list = new ArrayList<>();

        UseConstraint useConstraint = new UseConstraint();
        useConstraint.setData("{title: 'xxx'}");
        List<String> otherConstraints = Arrays.asList("My use constraint", "Quellenvermerk: my source note");
        useConstraint.setOtherConstraints(otherConstraints);
        list.add(useConstraint);
        UseConstraint useConstraint2 = new UseConstraint();
        useConstraint2.setData("{title: 'zzz'}");
        List<String> otherConstraints2 = Collections.singletonList("My other constraint");
        useConstraint2.setOtherConstraints(otherConstraints2);
        list.add(useConstraint2);

        return list;
    }

    private String getStringOf(JsonNode node, String key) {
        return node.has(key) ? node.get(key).asText() : null;
    }
}
