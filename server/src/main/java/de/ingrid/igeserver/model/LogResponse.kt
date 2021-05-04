package de.ingrid.igeserver.model

import java.time.OffsetDateTime

data class LogResponse(val lastIndexedDate: OffsetDateTime, val log: List<String>)
