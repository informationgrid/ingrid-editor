package de.ingrid.igeserver.exports;

import javax.script.Bindings;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.script.SimpleScriptContext;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import de.ingrid.igeserver.services.ExportPostProcessors;

@Service
public class JSPostProcessor implements ExportPostProcessors {
	
	private static Logger log = LogManager.getLogger(JSPostProcessor.class);

	@Override
	public Object process(Object exportedDoc, JsonNode jsonData) {
		ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
		
		// define a different script context
        ScriptContext newContext = new SimpleScriptContext();
        newContext.setBindings(engine.createBindings(), ScriptContext.ENGINE_SCOPE);
        Bindings engineScope = newContext.getBindings(ScriptContext.ENGINE_SCOPE);

        // set the variable to a different value in another scope
        engineScope.put("logMe", log);
        engineScope.put("source", jsonData);
        engineScope.put("target", exportedDoc);
		
		try {
			engine.eval("logMe.info('From Script!!!'); target.language = 'chinese';", newContext);
		} catch (ScriptException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return exportedDoc;
	}

	@Override
	public TransformationType getType() {
		return TransformationType.ISO;
	}

}
