package de.ingrid.igeserver.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.PublishedLink
import de.ingrid.igeserver.model.DocUVP
import java.lang.StringBuilder
import java.util.*
import javax.validation.constraints.NotNull

/**
 * Data
 */
@JsonIgnoreProperties(ignoreUnknown = true)
class DocUVP(
    @JsonProperty("_id") val id: String = "", 
    @JsonProperty("_profile") val profile: String = "",
    @PublishedLink(value = "ADDRESS") val authorRefs: String? = null,
    val taskId: @NotNull String? = null,
    val title: @NotNull String? = null)

/*
    fun id(id: String?): DocUVP {
        this.id = id
        return this
    }

    fun profile(profile: String?): DocUVP {
        this.profile = profile
        return this
    }
}
*/
