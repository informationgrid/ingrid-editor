package de.ingrid.igeserver.migrations

interface MigrationStrategy {

    val version: Version

    fun exec(databaseName: String)

    fun compareWithVersion(version: String): VersionCompare

}