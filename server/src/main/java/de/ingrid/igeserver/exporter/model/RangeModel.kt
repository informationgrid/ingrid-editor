package de.ingrid.igeserver.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class RangeModel(val start: String?, val end: String?)
