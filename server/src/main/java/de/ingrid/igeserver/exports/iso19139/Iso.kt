package de.ingrid.igeserver.exports.iso19139

import java.util.*

data class Iso(
        var uuid: String? = null,
        var parentIdentifier: String? = null,
        var title: String? = null,
        var alternateTitle: String? = null,
        var description: String? = null,
        var hierarchyLevel: String? = null,
        var modified: Date? = null,
        var useLimitations: List<UseConstraint> = mutableListOf(),
        var accessConstraints: List<UseConstraint> = mutableListOf(),
        var useConstraints: List<UseConstraint> = mutableListOf(),
        var thesauruses: List<Thesaurus>? = mutableListOf()
)