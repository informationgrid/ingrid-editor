package de.ingrid.igeserver.exports;

import java.io.IOException;
import java.io.StringWriter;

import javax.script.Bindings;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.script.SimpleScriptContext;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import de.ingrid.igeserver.exports.iso.Metadata;
import de.ingrid.igeserver.services.ExportPostProcessors;

@Service
public class IsoXmlPostProcessor implements ExportPostProcessors {
	
	private static Logger log = LogManager.getLogger(IsoXmlPostProcessor.class);

	@Override
	public Object process(Object exportedDoc, JsonNode jsonData) {
		ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
		
		// define a different script context
        ScriptContext newContext = new SimpleScriptContext();
        newContext.setBindings(engine.createBindings(), ScriptContext.ENGINE_SCOPE);
        Bindings engineScope = newContext.getBindings(ScriptContext.ENGINE_SCOPE);

        
        StringWriter stringWriter = new StringWriter();
        JAXBContext context = null;
        XmlMapper xmlMapper = new XmlMapper();
        ObjectNode xmlTree = null;
		try {
			context = JAXBContext.newInstance(Metadata.class);
			Marshaller marshaller = context.createMarshaller();
			marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
			marshaller.marshal(exportedDoc, stringWriter);
			xmlTree = (ObjectNode) xmlMapper.readTree(stringWriter.toString());
		} catch (JAXBException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        
        // set the variable to a different value in another scope
        engineScope.put("logMe", log);
        engineScope.put("source", jsonData);
        engineScope.put("target", xmlTree);
		
		try {
			// engine.eval("", newContext);
			engine.eval("target.put('specialField', 'cool');", newContext);
		} catch (ScriptException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
			try {
				return xmlMapper.writeValueAsString(xmlTree);
			} catch (JsonProcessingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			return null;
	}
	
	@Override
	public TransformationType getType() {
		return TransformationType.ISO;
	}

}
