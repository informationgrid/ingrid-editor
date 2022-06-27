package de.ingrid.igeserver.model

data class FrontendConfiguration(
    val keycloakUrl: String,
    val keycloakRealm: String,
    val keycloakClientId: String,
    val supportEmail: String,
    val keycloakEnabled: Boolean
)
