package de.ingrid.igeserver.profiles.ingrid_lubw_skdv_ok

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("profile.ingrid-lubw-skdv-ok")
data class LubwSkdvOkProperties(
    val publishEmailTo: String = "RIPS-Metadaten@lubw.bwl.de",
    val publishEmailContent: String = "Metadatensatz: {0}\n" +
        "UUID: {1}\n" +
        "Fachredakteur: {2}\n" +
        "Wann: {3}",
)
