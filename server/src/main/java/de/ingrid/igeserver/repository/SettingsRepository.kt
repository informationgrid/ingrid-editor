package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Settings
import org.springframework.data.jpa.repository.JpaRepository

interface SettingsRepository : JpaRepository<Settings, Int> {
    fun findByKey(key: String): Settings?
}
