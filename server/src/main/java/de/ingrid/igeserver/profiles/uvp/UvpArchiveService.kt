package de.ingrid.igeserver.profiles.uvp

import de.ingrid.igeserver.profiles.uvp.tasks.sqlDecisionDateBefore
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
import kotlin.jvm.java

data class WrapperAndDocId(val wrapperId: Int, val docId: Int)

@Service
class UvpArchiveService(val entityManager: EntityManager) {
    @Suppress("UNCHECKED_CAST")
    fun getDatasetsBeforeDecisionDate(catalogId: String, date: OffsetDateTime): List<WrapperAndDocId> = entityManager.createNativeQuery(
        sqlDecisionDateBefore(catalogId, date),
        WrapperAndDocId::class.java,
    ).resultList as List<WrapperAndDocId>
}
