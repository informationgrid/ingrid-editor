package de.ingrid.igeserver.profiles.bmi.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class AddressRefModel(val type: KeyValueModel?, val ref: AddressModel?)
