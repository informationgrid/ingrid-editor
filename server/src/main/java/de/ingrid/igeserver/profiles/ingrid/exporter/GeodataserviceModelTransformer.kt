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
package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import org.jetbrains.kotlin.util.suffixIfNot

open class GeodataserviceModelTransformer(
    model: IngridModel,
    catalogIdentifier: String,
    codelistTransformer: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
    cache: TransformerCache,
    doc: Document,
    documentService: DocumentService
) : IngridModelTransformer(
    model, catalogIdentifier, codelistTransformer, config, catalogService, cache, doc, documentService
) {

    override val hierarchyLevel = "service"
    override val hierarchyLevelName = "service"
    override val mdStandardName = "ISO19119"
    override val mdStandardVersion = "2005/PDAM 1"
    override val identificationType = "srv:SV_ServiceIdentification"
    override val extentType = "srv:extent"
    override val description: String
        get() {
            var description = model.data.description ?: ""

            val resolution = model.data.service?.resolution ?: emptyList()
            val denominator = resolution.joinToString(", ") { "1:" + it.denominator }
            val distanceMeter = resolution.map { it.distanceMeter }.joinToString("m, ")
            val distanceDPI = resolution.map { it.distanceDPI }.joinToString(", ")

            if (denominator.isNotEmpty()) description += " Maßstab: $denominator;"
            if (distanceMeter.isNotEmpty()) description += " Bodenauflösung: ${distanceMeter}m;"
            if (distanceDPI.isNotEmpty()) description += " Scanauflösung (DPI): $distanceDPI;"

            if (model.data.service?.systemEnvironment.isNullOrEmpty().not()) description += " Systemumgebung: ${model.data.service?.systemEnvironment};"
            if (model.data.service?.explanation.isNullOrEmpty().not()) description += " Erläuterung zum Fachbezug: ${model.data.service?.explanation};"


            return description.removeSuffix(";")
        }

    val abstractText = model.data.description ?: ""
    val history = data.service?.implementationHistory
    val conformanceResult = model.data.conformanceResult ?: emptyList()
    val hasAccessConstraint = model.data.service?.hasAccessConstraints ?: false


    init {
        if (model.data.identifier != null) {
            this.citationURL =
                (if (catalog.settings.config.namespace.isNullOrEmpty()) "https://registry.gdi-de.org/id/$catalogIdentifier" else catalog.settings.config.namespace!!).suffixIfNot(
                    "/"
                ) + model.data.identifier
        }
    }


}

