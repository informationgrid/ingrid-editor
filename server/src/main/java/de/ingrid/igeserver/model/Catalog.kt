package de.ingrid.igeserver.model

data class Catalog(val id: String, val name: String, val description: String = "", var type: String = "")