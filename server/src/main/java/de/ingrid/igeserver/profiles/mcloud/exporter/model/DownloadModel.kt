package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import de.ingrid.igeserver.exports.interfaces.dcat.Download
import de.ingrid.igeserver.exports.interfaces.dcat.LinkType

@JsonIgnoreProperties(ignoreUnknown = true)
data class DownloadModel(val title: String?, override val link: LinkTypeModel?, val type: String?, val format: String?): Download

data class LinkTypeModel(override val asLink: Boolean?, override val value: String?): LinkType
