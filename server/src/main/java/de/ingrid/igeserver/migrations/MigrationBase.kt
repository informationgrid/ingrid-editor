package de.ingrid.igeserver.migrations

enum class VersionCompare {
    SAME, LOWER, HIGHER
}

abstract class MigrationBase(val versionString: String) : MigrationStrategy {

    override val version
        get() = Version(versionString)

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as MigrationBase

        if (version != other.version) return false

        return true
    }

    override fun hashCode(): Int {
        return version.hashCode()
    }

    override fun compareWithVersion(version: String): VersionCompare {
        val result = this.version.compareTo(Version(version))

        return when {
            result < 0 -> VersionCompare.LOWER
            result == 0 -> VersionCompare.SAME
            result > 0 -> VersionCompare.HIGHER
            else -> throw Error("Impossible comparison result value $result")
        }
    }
}