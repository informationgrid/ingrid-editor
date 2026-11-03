/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
 * distributed under the Licence is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.profiles.ingrid_baw

import de.ingrid.igeserver.persistence.model.document.DocStateFilter
import de.ingrid.igeserver.persistence.model.document.StructuralChildrenOption

/**
 * BAW-specific configuration options for retrieving incoming references.
 *
 * @property docStateFilter Specifies a filter to determine the document state to consider when retrieving references.
 * @property onlyInCoupledResources Indicates whether to restrict references to coupled resources only.
 * @property literatureReferences Indicates whether to include literature references in the query.
 * @property addStructuralChildren Determines whether structural child references should be included. Only works with [onlyInCoupledResources] set to false.
 */
data class BawIncomingReferenceOptions(
    override val docStateFilter: DocStateFilter = DocStateFilter.LATEST,
    val onlyInCoupledResources: Boolean = false,
    val literatureReferences: Boolean = false,
    override val addStructuralChildren: Boolean = false,
) : StructuralChildrenOption
