package de.ingrid.igeserver.api

import com.thoughtworks.xstream.XStream
import com.thoughtworks.xstream.io.HierarchicalStreamWriter
import com.thoughtworks.xstream.io.json.JsonHierarchicalStreamDriver
import com.thoughtworks.xstream.io.json.JsonWriter
import de.ingrid.codelists.CodeListService
import de.ingrid.codelists.model.CodeList
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.io.Writer

@RestController
@RequestMapping("/api")
class CodelistApiController : CodelistApi {
    private val codelists: List<CodeList>
    override fun getCodelistById(id: String?): ResponseEntity<String?>? {
        var found: CodeList? = null
        // filter codelist by ID
        for (cl in codelists) {
            if (cl.id == id) {
                found = cl
                break
            }
        }
        return ResponseEntity.ok(createJSON(found))
    }

    private fun createJSON(obj: Any?): String {
        val xstream = XStream(object : JsonHierarchicalStreamDriver() {
            override fun createWriter(writer: Writer): HierarchicalStreamWriter {
                return JsonWriter(writer, JsonWriter.DROP_ROOT_MODE)
            }
        })

        //XStream xstream = new XStream(new JettisonMappedXmlDriver());
        //xstream.setMode(XStream.NO_REFERENCES);
        return xstream.toXML(obj)
    }

    init {
        val codeListService = CodeListService()
        codelists = codeListService.initialCodelists
    }
}
