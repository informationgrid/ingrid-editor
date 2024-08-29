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
package de.ingrid.igeserver.features.ogc_api_records.export_catalog

import de.ingrid.igeserver.services.DocumentCategory

/**
 * @param category the category (data/address) of the exporter
 * @param type the ID of the exporter
 * @param name the display name of the exporter
 * @param description a description for the exporter
 * @param dataType defines the type of the resulting document (e.g. application/json)
 * @param profiles in which profiles can this exporter be used
 *
 */
data class CatalogExportTypeInfo(val category: DocumentCategory, val type: String, val name: String, val description: String, val dataType: String, val fileExtension: String, val profiles: List<String>, val isPublic: Boolean = true)
