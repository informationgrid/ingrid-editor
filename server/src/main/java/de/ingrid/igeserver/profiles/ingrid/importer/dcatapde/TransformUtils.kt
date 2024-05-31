/*
 * **************************************************-
 * ogc-records-api
 * ==================================================
 * Copyright (C) 2022 - 2024 wemove digital solutions GmbH
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
 * **************************************************#
 */
package de.ingrid.igeserver.profiles.ingrid.importer.dcatapde

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.json.JsonMapper
import org.apache.commons.io.IOUtils
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.riot.Lang
import org.apache.jena.riot.RDFDataMgr
import java.io.IOException

object TransformUtils {
    /**
     * Creates a GeoJson string from GeoShapes in the Freemarker template.
     *
     * @param geoShapeMap a geoshape as a Java map or list
     * @return a corresponding GeoJson string
     * @throws IOException
     */
    @Throws(IOException::class)
    fun geoshapeToJson(geoShapeMap: Any?): String {
        val mapper: ObjectMapper = JsonMapper()
        return mapper.writeValueAsString(geoShapeMap)
    }

    /**
     * Parses an RDF model from an RDF string.
     *
     * @param serializedRdf a serialized RDF model
     * @param rdfFormat the serialization format in which the RDF is supplied
     * @return an Apache Jena RDF model of the supplied RDF serialization
     */
    @JvmStatic
    fun getRdfModel(serializedRdf: String?, rdfFormat: Lang?): Model {
        val `is` = IOUtils.toInputStream(serializedRdf, "utf-8")
        val model = ModelFactory.createDefaultModel()
        RDFDataMgr.read(model, `is`, rdfFormat)
        return model
    }

    /**
     * Mutates a given map; inserts the given key-value pair if the value is not null.
     *
     * @param properties the map to mutate
     * @param key
     * @param value
     */
    fun putIfNotNull(properties: MutableMap<String?, Any?>, key: String?, value: Any?) {
        if (value != null) {
            properties[key] = value
        }
    }
}
