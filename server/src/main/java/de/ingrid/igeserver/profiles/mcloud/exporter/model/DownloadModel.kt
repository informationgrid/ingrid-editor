package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class DownloadModel(val title: String?, val link: String, val type: String, val format: String?)
