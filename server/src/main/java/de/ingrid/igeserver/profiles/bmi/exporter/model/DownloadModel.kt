package de.ingrid.igeserver.profiles.bmi.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.exports.interfaces.dcat.Download
import de.ingrid.igeserver.exports.interfaces.dcat.LinkType
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import org.json.simple.parser.JSONParser
import java.time.OffsetDateTime

@JsonIgnoreProperties(ignoreUnknown = true)
data class DownloadModel(val title: String?,
                         override val link: LinkTypeModel?,
                         val type: KeyValueModel?,
                         val format: KeyValueModel?,
                         val description: String?,
                         val license: KeyValueModel?,
                         val byClause: String?,
                         @JsonDeserialize(using = DateDeserializer::class)
                         val modified: OffsetDateTime?,
                         val availability: KeyValueModel?,
                         val languages: List<KeyValueModel>?
    ): Download
    {
    val languageKeys: List<String>?
        get() = languages?.map { it.key }?.filterNotNull()

    fun getLicenseData(): Any? {
        if(license != null) {
            var jsonString = "{\"id\":\""+license.key+"\",\"name\":\""+license.value+"\"}";
            // either use key or if no key search for value
            val entryID = license.key ?: BmiModel.codeListService?.getCodeListEntryId("6500", license.value, "de")
            if(entryID != null) {
                val codeListEntry = BmiModel.codeListService?.getCodeListEntry("6500", entryID)
                if(!codeListEntry?.data.isNullOrEmpty()) {
                    jsonString = codeListEntry?.data.toString();
                } else if(codeListEntry?.getField("de") != null) {
                    jsonString = "{\"id\":\""+license.key+"\",\"name\":\""+codeListEntry.getField("de")+"\"}";
                }
            }
            return if (jsonString.isEmpty()) null else JSONParser().parse(jsonString)
        }
        return null
    }
    }
@JsonIgnoreProperties(ignoreUnknown = true)
data class LinkTypeModel(override val asLink: Boolean?, override val value: String?): LinkType
