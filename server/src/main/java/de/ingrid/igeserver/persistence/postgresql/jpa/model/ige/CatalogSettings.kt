package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import de.ingrid.igeserver.api.messaging.IndexMessage

data class CatalogSettings(var indexCronPattern: String? = null, var lastLogSummary: IndexMessage? = null)