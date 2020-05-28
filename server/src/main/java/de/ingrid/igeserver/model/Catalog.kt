package de.ingrid.igeserver.model

data class Catalog(var id: String?, val name: String, val description: String? = "", var type: String = "")