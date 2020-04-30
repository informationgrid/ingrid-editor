package de.ingrid.igeserver.api;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.HierarchicalStreamWriter;
import com.thoughtworks.xstream.io.json.JsonHierarchicalStreamDriver;
import com.thoughtworks.xstream.io.json.JsonWriter;
import de.ingrid.codelists.CodeListService;
import de.ingrid.codelists.model.CodeList;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.Writer;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CodelistApiController implements CodelistApi {

    private List<CodeList> codelists;

    public CodelistApiController() {
        CodeListService codeListService = new CodeListService();
        this.codelists = codeListService.getInitialCodelists();
    }

    public ResponseEntity<String> getCodelistById(String id) {

        CodeList found = null;
        // filter codelist by ID
        for (CodeList cl : this.codelists) {
            if (cl.getId().equals(id)) {
                found = cl;
                break;
            }
        }

        return ResponseEntity.ok(createJSON(found));
    }

    private String createJSON(Object obj) {
        XStream xstream = new XStream(new JsonHierarchicalStreamDriver() {
            @Override
            public HierarchicalStreamWriter createWriter(Writer writer) {
                return new JsonWriter(writer, JsonWriter.DROP_ROOT_MODE);
            }
        });

        //XStream xstream = new XStream(new JettisonMappedXmlDriver());
        //xstream.setMode(XStream.NO_REFERENCES);
        return xstream.toXML(obj);
    }

}
