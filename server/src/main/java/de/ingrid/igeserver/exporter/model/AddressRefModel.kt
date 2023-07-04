package de.ingrid.igeserver.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class AddressRefModel(val type: KeyValueModel?, val ref: AddressModel?)
