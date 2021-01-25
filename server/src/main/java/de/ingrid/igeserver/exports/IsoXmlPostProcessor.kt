package de.ingrid.igeserver.exports

import de.ingrid.igeserver.services.ExportPostProcessors
import javax.script.ScriptEngineManager
import javax.script.SimpleScriptContext
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import de.ingrid.igeserver.exports.IsoXmlPostProcessor
import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.exports.iso.Metadata
import org.apache.logging.log4j.LogManager
import java.io.StringWriter
import java.lang.Boolean
import javax.script.ScriptContext
import javax.script.ScriptException
import javax.xml.bind.JAXBContext
import javax.xml.bind.JAXBException
import javax.xml.bind.Marshaller

// @Service
class IsoXmlPostProcessor : ExportPostProcessors {
    override fun process(exportedDoc: Any?, jsonData: JsonNode): Any? {
//		PebbleEngine engine = new PebbleEngine.Builder().build();
        val engine = ScriptEngineManager().getEngineByName("nashorn")

        // define a different script context
        val newContext: ScriptContext = SimpleScriptContext()
        newContext.setBindings(engine.createBindings(), ScriptContext.ENGINE_SCOPE)
        val engineScope = newContext.getBindings(ScriptContext.ENGINE_SCOPE)
        val stringWriter = StringWriter()
        val context: JAXBContext
        val xmlMapper = XmlMapper()
        var xmlTree: ObjectNode? = null
        try {
            context = JAXBContext.newInstance(Metadata::class.java)
            val marshaller = context.createMarshaller()
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE)
            marshaller.marshal(exportedDoc, stringWriter)
            xmlTree = xmlMapper.readTree(stringWriter.toString()) as ObjectNode
        } catch (e: JAXBException) {
            log.error(e)
        } catch (e: JsonProcessingException) {
            log.error(e)
        }

        // set the variable to a different value in another scope
        engineScope["logMe"] = log
        engineScope["source"] = jsonData
        engineScope["target"] = xmlTree
        try {
            // engine.eval("", newContext);
            engine.eval("target.put('specialField', 'cool');", newContext)
        } catch (e: ScriptException) {
            // TODO Auto-generated catch block
            e.printStackTrace()
        }
        try {
            return xmlMapper.writeValueAsString(xmlTree)
        } catch (e: JsonProcessingException) {
            // TODO Auto-generated catch block
            e.printStackTrace()
        }
        return null
    }

    override val type: ExportPostProcessors.TransformationType
        get() = ExportPostProcessors.TransformationType.ISO

    companion object {
        private val log = LogManager.getLogger(
            IsoXmlPostProcessor::class.java
        )
    }
}
