package de.ingrid.igeserver.exports.iso19115

data class UseConstraint(
    var name: String? = null,
    var data: String? = null,
    var otherConstraints: List<String>? = null
)