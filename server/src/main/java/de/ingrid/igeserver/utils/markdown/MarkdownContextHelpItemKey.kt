/*-
 * **************************************************-
 * InGrid Portal MDEK Application
 * ==================================================
 * Copyright (C) 2014 - 2020 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.1 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * http://ec.europa.eu/idabc/eupl5
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 * **************************************************#
 */
package de.ingrid.igeserver.utils.markdown

import java.util.*

class MarkdownContextHelpItemKey(fieldId: String?) {
    /**
     * ID fo the ingrid form.
     */
    var fieldId: String? = null

    /**
     * Document type, since help messages for different types can have same ID
     */
    var docType: String? = null

    /**
     * Language ISO 639-1
     */
    var lang: String = "de"

    /**
     * Profile string
     */
    var profile: String? = null

    override fun toString(): String {
        return "MarkdownContextHelpItem: {fieldId: $fieldId; docType: $docType; lang: $lang; profile: $profile}"
    }

    override fun equals(o: Any?): Boolean {
        if (o === this) return true
        if (o !is MarkdownContextHelpItemKey) {
            return false
        }
        val itemKey = o
        return (fieldId == itemKey.fieldId
                && lang == itemKey.lang
                && docType == itemKey.docType
                && profile == itemKey.profile)
    }

    override fun hashCode(): Int {
        return Objects.hash(fieldId, lang, docType, profile)
    }

    init {
        this.fieldId = fieldId
    }
}