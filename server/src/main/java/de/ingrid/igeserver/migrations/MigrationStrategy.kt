package de.ingrid.igeserver.migrations

interface MigrationStrategy {

    val version: Version

    /**
     * Run the migration
     */
    fun exec()

    /**
     * Run after all other migrations have been run. This is like a second round, after the
     * db model has been updated to the latest and we can safely use spring data stuff.
     */
    fun postExec()

    fun compareWithVersion(version: String): VersionCompare

}