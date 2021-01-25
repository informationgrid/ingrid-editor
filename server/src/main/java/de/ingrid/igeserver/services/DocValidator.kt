package de.ingrid.igeserver.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.deser.std.UntypedObjectDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import de.ingrid.igeserver.model.DocUVP;

//@Service
public class DocValidator extends MapperService {
    
    @SuppressWarnings({ "deprecation", "serial" })
    public static class FixedUntypedObjectDeserializer extends UntypedObjectDeserializer {

        @Override
        @SuppressWarnings({ "unchecked", "rawtypes" })
        protected Object mapObject(JsonParser p, DeserializationContext ctxt) throws IOException {
            String firstKey;

            JsonToken t = p.getCurrentToken();

            if (t == JsonToken.START_OBJECT) {
                firstKey = p.nextFieldName();
            } else if (t == JsonToken.FIELD_NAME) {
                firstKey = p.getCurrentName();
            } else {
                if (t != JsonToken.END_OBJECT) {
                    throw ctxt.mappingException(handledType(), p.getCurrentToken());
                }
                firstKey = null;
            }

            // empty map might work; but caller may want to modify... so better
            // just give small modifiable
            LinkedHashMap<String, Object> resultMap = new LinkedHashMap<String, Object>(2);
            if (firstKey == null)
                return resultMap;

            p.nextToken();
            resultMap.put(firstKey, deserialize(p, ctxt));

            // 03-Aug-2016, jpvarandas: handle next objects and create an array
            Set<String> listKeys = new LinkedHashSet<>();

            String nextKey;
            while ((nextKey = p.nextFieldName()) != null) {
                p.nextToken();
                if (resultMap.containsKey(nextKey)) {
                    Object listObject = resultMap.get(nextKey);

                    if (!(listObject instanceof List)) {
                        listObject = new ArrayList<>();
                        ((List) listObject).add(resultMap.get(nextKey));

                        resultMap.put(nextKey, listObject);
                    }

                    ((List) listObject).add(deserialize(p, ctxt));

                    listKeys.add(nextKey);

                } else {
                    resultMap.put(nextKey, deserialize(p, ctxt));

                }
            }

            return resultMap;

        }
    }

    private Validator validator;

    public DocValidator() throws Exception {

        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();

        /*test();

        // EXAMPLE
        String json = "{ \"_id\": 4, \"name\": \"Andre\", \"age\": 38, \"_profile\": \"UVP\", \"author\": \"12345\" }";
        run( json );*/

    }

    private void test() throws Exception {

        XmlMapper xmlMapper = new XmlMapper();
        xmlMapper.registerModule( new SimpleModule().addDeserializer( Object.class, new FixedUntypedObjectDeserializer() ) );
        
        // xmlMapper.enable( DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY  );
        // xmlMapper.enable( DeserializationFeature.UNWRAP_SINGLE_VALUE_ARRAYS );
        // JsonNode node = xmlMapper.readTree( getClass().getResourceAsStream( "/csw_test_import_example.xml" ) );
        Object node = xmlMapper.readValue( getClass().getResourceAsStream( "/csw_test_import_example.xml" ), Object.class );

        
        ObjectMapper jsonMapper = new ObjectMapper();
        String json = jsonMapper.writeValueAsString( node );
        System.out.println( json );

    }

    public Set<ConstraintViolation<Object>> run(String json) throws Exception {
        String profile = getJsonNode( json ).get( "_profile" ).asText();

        Class<?> validatorBeanClass = null;
        switch (profile) {
        case "UVP":
            validatorBeanClass = DocUVP.class;
        }

        Object data = new ObjectMapper().readValue( json, validatorBeanClass );

        Set<ConstraintViolation<Object>> validationResult = validator.validate( data );

        validationResult.size();
        return validationResult;
    }

}
