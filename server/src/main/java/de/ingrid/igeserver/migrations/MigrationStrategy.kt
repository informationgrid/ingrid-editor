package de.ingrid.igeserver.migrations

interface MigrationStrategy {

    val version: Version

    fun exec()

    fun compareWithVersion(version: String): VersionCompare

}