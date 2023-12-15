/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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

    override fun postExec() {}

    override fun compareWithVersion(version: String): VersionCompare {
        val result = this.version.compareTo(Version(version))

        return when {
            result < 0 -> VersionCompare.LOWER
            result == 0 -> VersionCompare.SAME
            else -> VersionCompare.HIGHER
        }
    }
}
