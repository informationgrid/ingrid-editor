package de.ingrid.igeserver.exports

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exports.JSPostProcessor
import de.ingrid.igeserver.services.ExportPostProcessors
import org.apache.logging.log4j.LogManager
import org.springframework.stereotype.Service
import javax.script.ScriptContext
import javax.script.ScriptEngineManager
import javax.script.ScriptException
import javax.script.SimpleScriptContext

@Service
class JSPostProcessor : ExportPostProcessors {
    override fun process(exportedDoc: Any?, jsonData: JsonNode): Any? {
        val engine = ScriptEngineManager().getEngineByName("nashorn")

        // define a different script context
        val newContext: ScriptContext = SimpleScriptContext()
        newContext.setBindings(engine.createBindings(), ScriptContext.ENGINE_SCOPE)
        val engineScope = newContext.getBindings(ScriptContext.ENGINE_SCOPE)

        // set the variable to a different value in another scope
        engineScope["logMe"] = log
        engineScope["source"] = jsonData
        engineScope["target"] = exportedDoc
        try {
            engine.eval("logMe.Info('From Script!!!'); target.language = 'chinese';", newContext)
        } catch (e: ScriptException) {
            // TODO Auto-generated catch block
            e.printStackTrace()
        }
        return exportedDoc
    }

    override val type: ExportPostProcessors.TransformationType
        get() = ExportPostProcessors.TransformationType.ISO

    companion object {
        private val log = LogManager.getLogger(
            JSPostProcessor::class.java
        )
    }
}
