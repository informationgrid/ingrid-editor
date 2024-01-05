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
package de.ingrid.igeserver.model

import com.fasterxml.jackson.annotation.JsonIgnore

abstract class QuickFilter {
    abstract val id: String

    abstract val label: String

    @get:JsonIgnore
    abstract val filter: String

    @get:JsonIgnore
    open val isFieldQuery: Boolean = false

    open val codelistId: String? = null
    
    // in case the codelist ID is catalog specific stored in a behaviour
    // format: <behaviourId>::<field>::<defaultValue>
    open val codelistIdFromBehaviour: String? = null

    open fun filter(parameter: List<*>? = null): String = this.filter

    open val parameters: List<String> = emptyList()

    open val implicitFilter: List<String> = emptyList()
}
