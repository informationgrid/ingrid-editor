/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
