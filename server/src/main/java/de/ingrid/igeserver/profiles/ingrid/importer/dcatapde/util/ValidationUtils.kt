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
package de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.util

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.ServerException.Companion.withReason
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.RecordPLUProperties
import jakarta.validation.Validator
import jakarta.validation.ValidatorFactory
import jakarta.validation.groups.Default
import org.apache.commons.lang3.StringUtils
import org.apache.jena.graph.Graph
import org.apache.jena.rdf.model.Model
import org.apache.jena.riot.RDFDataMgr
import org.apache.jena.shacl.ShaclValidator
import org.apache.jena.shacl.validation.ReportEntry
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.util.regex.Pattern

@Profile("ingrid")
@Component
class ValidationUtils(@Autowired validatorFactory: ValidatorFactory) {
    private val validator: Validator = validatorFactory.validator
    private val shaclGraph: Graph =
        RDFDataMgr.loadGraph(javaClass.classLoader.getResource("ingrid/dcat-ap-plu_shacl-shapes.ttl").toString())

    private val patterns: Map<String, Pattern> = java.util.Map.of(
        "mandatory", Pattern.compile("minCount\\[1\\].*"),
        "classConstraint", Pattern.compile("ClassConstraint\\[(<.+>)\\]: Expected class :\\1 for .*")
    )

    @Throws(ServerException::class)
    fun validateSyntax(model: Model) {
        val report = ShaclValidator.get().validate(shaclGraph, model.graph)
        if (!report.conforms()) {
            for (e in report.entries) {
                // only report the first occurring error
                throw withReason("Validation error: " + parseReportEntry(e), null)
            }
        }
    }

    private fun parseReportEntry(e: ReportEntry): String {
        var path = e.resultPath().toString()
        var reason = e.message()
        var matcher = patterns["mandatory"]!!.matcher(reason)
        if (matcher.find()) { // (reason.startsWith("minCount[1]")) {
            reason = "must not be null"
        }
        matcher = patterns["classConstraint"]!!.matcher(reason)
        if (matcher.find()) {
            path = matcher.group(1)
            reason = "must not be null"
        }
        return String.format("%s %s", path, reason)
    }

    /**
     * Validates a record according to its field annotations.
     * Throws an ApiException if a required field is not set.
     *
     * @param entity the entity whose fields to validate
     * @throws ServerException
     */
    @Throws(ServerException::class)
    fun validateFields(entity: Any) {
        // also validate necessary transient fields (for which we explicitly skip validation during persistance)
        val violations =
            validator.validate(entity, Default::class.java, TransientGroup::class.java)
        if (!violations.isEmpty()) {
            val v = violations.iterator().next()
            //            String propName = v.getPropertyPath().toString();
            throw withReason("Validation error: " + v.message, null)
        }
    }

    companion object {
        @Throws(ReflectiveOperationException::class)
        private fun getMaps(record: RecordPLUProperties, fieldName: String): Set<Map<String, Any>>? {
            val getter = record.javaClass.getDeclaredMethod("get" + StringUtils.capitalize(fieldName))
            var maps = getter.invoke(record)
            if (maps is Map<*, *>) {
                maps = setOf(maps as Map<String, Any>)
            }
            return maps as Set<Map<String, Any>>
        }
    }
}
