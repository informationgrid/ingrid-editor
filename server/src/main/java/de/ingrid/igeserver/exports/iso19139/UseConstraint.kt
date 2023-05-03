package de.ingrid.igeserver.exports.iso19139

data class UseConstraint(
    var name: String? = null,
    var data: String? = null,
    var otherConstraints: List<String>? = null
)