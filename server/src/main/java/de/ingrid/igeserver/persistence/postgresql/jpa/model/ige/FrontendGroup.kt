package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

class FrontendGroup(
    var backendGroup: Group,
    var currentUserIsMember: Boolean? = null
)
