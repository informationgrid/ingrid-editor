package de.ingrid.igeserver.profiles.bmi.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class KeyValueModel(val key: String?, val value: String?)
