package de.ingrid.igeserver.exports;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeCreator;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orientechnologies.orient.core.sql.parser.OJson;
import de.ingrid.igeserver.exports.iso19115.Iso19115Exporter;
import org.hamcrest.CoreMatchers;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertThat;

public class IsoExport {

    private Iso19115Exporter exporter;

    @Before
    public void init() {
        exporter = new Iso19115Exporter();
    }

    @Test
    public void normalExport() throws IOException {
        String json = "{\"title\": \"Test Export 1\", \"description\": \"This is the description of the exported document\"}";
        JsonNode jsonNode = new ObjectMapper().readTree(json);
        String result = ((String) exporter.run(jsonNode)).replaceAll("\n\\s+", "");

        assertThat(result, CoreMatchers.containsString(
                "<gmd:title>" +
                        "<gco:CharacterString>Test Export 1</gco:CharacterString>" +
                        "</gmd:title>"));
        assertThat(result, CoreMatchers.containsString(
                "<gmd:abstract>" +
                        "<gco:CharacterString>This is the description of the exported document</gco:CharacterString>" +
                        "</gmd:abstract>"));
    }

    @Test
    public void anchorLink() throws IOException {
        String json = "{ \"keywords\": [{ \"name\": \"test-keyword 1\", \"link\": \"http://abc.de/xyz\"}]}";
        JsonNode jsonNode = new ObjectMapper().readTree(json);

        String result = ((String) exporter.run(jsonNode)).replaceAll("\n\\s+", "");

        assertThat(result, CoreMatchers.containsString(
                "<gmx:Anchor xlink:href=\"http://abc.de/xyz\">test-keyword 1</gmx:Anchor>"));
        assertThat(result, CoreMatchers.containsString(
                "<gmd:title><gco:CharacterString>Mein Thesaurus</gco:CharacterString></gmd:title>"));
        assertThat(result, CoreMatchers.containsString(
                "<gco:Date>10.10.1978</gco:Date>"));
    }

}
