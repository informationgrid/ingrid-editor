package de.ingrid.igeserver.persistence

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper

class FindAllResults(var totalHits: Long, var hits: List<DocumentWrapper>) 