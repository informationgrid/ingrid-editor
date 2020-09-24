package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import de.ingrid.igeserver.exports.interfaces.dcat.Download

@JsonIgnoreProperties(ignoreUnknown = true)
data class DownloadModel(val title: String?, override val link: String?, val type: String?, val format: String?): Download
