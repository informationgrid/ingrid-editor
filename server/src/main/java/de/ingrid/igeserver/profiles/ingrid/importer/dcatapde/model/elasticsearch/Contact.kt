/**
 * ==================================================
 * Copyright (C) 2022-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.elasticsearch

import java.io.Serializable
import java.util.*

class Contact : Serializable {
    var fn: String? = null

    var hasOrganizationName: String? = null

    var hasPostalCode: String? = null

    var hasStreetAddress: String? = null

    var hasLocality: String? = null

    var hasRegion: String? = null

    var hasCountryName: String? = null

    var hasEmail: String? = null

    var hasTelephone: String? = null

    var type: String? = null

    override fun equals(o: Any?): Boolean {
        if (this === o) {
            return true
        }
        if (o == null || javaClass != o.javaClass) {
            return false
        }
        val contact = o as Contact
        return fn == contact.fn && hasOrganizationName == contact.hasOrganizationName && hasPostalCode == contact.hasPostalCode && hasStreetAddress == contact.hasStreetAddress && hasLocality == contact.hasLocality && hasRegion == contact.hasRegion && hasCountryName == contact.hasCountryName && hasEmail == contact.hasEmail && hasTelephone == contact.hasTelephone
    }

    override fun hashCode(): Int {
        return Objects.hash(
            fn,
            hasOrganizationName,
            hasPostalCode,
            hasStreetAddress,
            hasLocality,
            hasRegion,
            hasCountryName,
            hasEmail,
            hasTelephone,
        )
    }

    override fun toString(): String {
        return "Contact{" +
            "fn='" + fn + '\'' +
            ", hasOrganizationName='" + hasOrganizationName + '\'' +
            ", hasPostalCode='" + hasPostalCode + '\'' +
            ", hasStreetAddress='" + hasStreetAddress + '\'' +
            ", hasLocality='" + hasLocality + '\'' +
            ", hasRegion='" + hasRegion + '\'' +
            ", hasCountryName='" + hasCountryName + '\'' +
            ", hasEmail='" + hasEmail + '\'' +
            ", hasTelephone='" + hasTelephone + '\'' +
            '}'
    }
}
