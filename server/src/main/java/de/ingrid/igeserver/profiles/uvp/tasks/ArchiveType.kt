package de.ingrid.igeserver.profiles.uvp.tasks

import com.fasterxml.jackson.annotation.JsonProperty

enum class ArchiveType {
    @JsonProperty("hideAll")
    HIDE_ALL,

    @JsonProperty("showAll")
    SHOW_ALL,

    @JsonProperty("showOnlyDecision")
    SHOW_ONLY_DECISION,
}
