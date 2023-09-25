package de.ingrid.igeserver.index

import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.model.BoolFilter
import de.ingrid.igeserver.model.IndexConfigOptions
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogSettings
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.*
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.jpa.AvailableHints
import org.hibernate.query.NativeQuery
import org.jetbrains.kotlin.utils.indexOfFirst
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service


data class DocumentIndexInfo(
    val document: Document,
    val iBusIndex: List<Int>?
)

@Service
class IndexService @Autowired constructor(
    private val catalogRepo: CatalogRepository,
    private val exportService: ExportService,
    @Lazy private val documentService: DocumentService,
    private val researchService: ResearchService,
    private val entityManager: EntityManager,
    private val settingsService: SettingsService,
    private val generalProperties: GeneralProperties
) {

    private val log = logger()

    fun getSinglePublishedDocument(
        catalogId: String,
        category: String,
        catalogProfile: CatalogProfile,
        uuid: String
    ): DocumentIndexInfo {
        val docs = requestPublishableDocuments(catalogId, category, uuid, catalogProfile)
        return docs.single()
    }

    fun getPublishedDocuments(
        catalogId: String,
        category: String,
        catalogProfile: CatalogProfile,
        currentPage: Int = 0,
        totalHits: Long
    ): Page<DocumentIndexInfo> {
        val docs = requestPublishableDocuments(
            catalogId,
            category,
            null,
            catalogProfile,
            ResearchPaging(currentPage + 1, generalProperties.indexPageSize)
        )
        val pagedDocs = PageImpl(docs, Pageable.ofSize(generalProperties.indexPageSize), totalHits)

        return if (pagedDocs.isEmpty) {
            log.warn("No documents found in category '$category' for indexing")
            Page.empty()
        } else {
            pagedDocs
        }
    }

    private fun searchAndGetDocuments(
        catalogId: String,
        filter: BoolFilter,
        currentPage: Int = 0
    ): Pair<Long, List<Document>> {
        val response = researchService.query(
            catalogId,
            ResearchQuery(null, filter, pagination = ResearchPaging(currentPage + 1, generalProperties.indexPageSize))
        )
        val docsToIndex = response.hits
            .map { documentService.getLastPublishedDocument(catalogId, it._uuid!!).apply { wrapperId = it._id } }
        return Pair(response.totalHits.toLong(), docsToIndex)
    }

    private fun createConditionsForDocumentsToPublish(
        catalogId: String,
        category: String,
        profile: CatalogProfile,
        uuid: String? = null
    ): BoolFilter {
        val conditions = mutableListOf("category = '$category'", "document1.state = 'PUBLISHED'", "deleted = 0")

        uuid?.let { conditions.add("document_wrapper.uuid = '$it'") }

        // add system specific conditions
        conditions.addAll(getSystemSpecificConditions())

        // add profile specific conditions
        conditions.addAll(profile.additionalPublishConditions(catalogId))

        return BoolFilter("AND", conditions, null, null, false)
    }

    private fun getSystemSpecificConditions(): List<String> {
        var publicationTypesPerIBus = settingsService.getIBusConfig().mapNotNull { it.publicationTypes }

        // provide at least one empty iBus configuration
        if (publicationTypesPerIBus.isEmpty()) publicationTypesPerIBus = listOf(emptyList())

        return publicationTypesPerIBus.map { types ->
            var conditions: String = types
                .filter { it != "internet" }
                .joinToString(" OR ") { "'{$it}' && document_wrapper.tags" }
            if (types.contains("internet") || types.isEmpty()) {
                if (conditions.isNotEmpty()) conditions += " OR"
                conditions += " document_wrapper.tags is null OR '{}' = document_wrapper.tags"
            }
            "($conditions)"
        }
    }

    fun getExporter(category: DocumentCategory, exportFormat: String): IgeExporter =
        exportService.getExporter(category, exportFormat)

    fun updateConfig(config: IndexConfigOptions) {

        val catalog = catalogRepo.findByIdentifier(config.catalogId)
        if (catalog.settings == null) {
            catalog.settings = CatalogSettings(config.cronPattern)
        } else {
            catalog.settings!!.indexCronPattern = config.cronPattern
        }
        catalog.settings!!.exportFormat = config.exportFormat
        catalogRepo.save(catalog)

    }

    fun getLastLog(catalogId: String): IndexMessage? = catalogRepo.findByIdentifier(catalogId)
        .settings?.lastLogSummary

    fun requestPublishableDocuments(
        catalogId: String,
        category: String,
        uuid: String?,
        profile: CatalogProfile,
        paging: ResearchPaging = ResearchPaging(pageSize = generalProperties.indexPageSize)
    ): List<DocumentIndexInfo> {
        val iBusConditions = getSystemSpecificConditions()
        val sql = createSqlForPublishedDocuments(profile, catalogId, iBusConditions, category, uuid)
        val orderBy = " GROUP BY document_wrapper.uuid, document_wrapper.id ORDER BY document_wrapper.uuid"

        val nativeQuery = entityManager.createNativeQuery(sql + orderBy)

        nativeQuery.setParameter(1, catalogId)

        val result = nativeQuery
            .setHint(AvailableHints.HINT_READ_ONLY, true)
            .unwrap(NativeQuery::class.java)
            .addScalar("uuid")
            .addScalar("id")
            .addScalar("type")
            .addScalar("ibus")
            .setFirstResult((paging.page - 1) * paging.pageSize)
            .setMaxResults(paging.pageSize)
            .resultList as List<Array<out Any?>>

        return result.map {
            IndexDocumentResult(it[0] as String, it[1] as Int, it[2] as String, it[3] as String)
        }.map {
            // FOLDERS do not have a published version
            val document = if (it.type == "FOLDER") {
                documentService.getDocumentByWrapperId(catalogId, it.wrapperId)
            } else {
                documentService.getLastPublishedDocument(catalogId, it.uuid)
            }
            DocumentIndexInfo(
                document.apply { wrapperId = it.wrapperId },
                it.ibus.split(",").map { it.toInt() }
            )
        }
    }

    private fun createSqlForPublishedDocuments(
        profile: CatalogProfile,
        catalogId: String,
        iBusConditions: List<String>,
        category: String,
        uuid: String?
    ): String {
        val profileConditions = profile.additionalPublishConditions(catalogId)
        val iBusSelector = getConditionsForIBus(iBusConditions)

        val indexFolders = """OR (document1.type = 'FOLDER' AND document1.state = 'DRAFT')"""
        var sql = """
                SELECT document_wrapper.uuid, document_wrapper.id, document_wrapper.type,
                CASE 
                    ${iBusSelector.joinToString(" ")}
                    ELSE '-1' END AS IBUS
                FROM document_wrapper JOIN document document1 ON document_wrapper.uuid=document1.uuid, catalog
                WHERE document_wrapper.catalog_id = catalog.id AND document1.catalog_id = catalog.id AND category = '$category' AND (document1.state = 'PUBLISHED' $indexFolders) AND deleted = 0 AND catalog.identifier = ? AND 
                (${iBusConditions.joinToString(" OR ")})
            """.trimIndent()
        uuid?.let { sql += " AND document_wrapper.uuid = '$it'" }
        if (profileConditions.isNotEmpty()) sql += " AND ${profileConditions.joinToString(" AND ")}"
        return sql
    }

    /**
     * For all iBus conditions special SQL conditions are created including information to which iBus the dataset 
     * is going to be sent. First we get all possible combinations of the conditions and determine the indexes
     * which iBus is used for a condition. This is especially important when two or more iBus conditions are the
     * same.
     */
    private fun getConditionsForIBus(
        iBusConditions: List<String>
    ): List<String> {
        val iBusSelector = mutableListOf<Pair<Set<Int>, String>>()

        for (i in iBusConditions.size downTo 1) {
            val combinations = iBusConditions.combinations(i)
            combinations.forEach { combination ->
                val indexCombinations = getCombinationOfIndexes(combination, iBusConditions)

                iBusSelector.add(
                    Pair(
                        indexCombinations,
                        "WHEN (" + combination.toSet().joinToString(" AND ") + ") THEN '${
                            indexCombinations.joinToString(
                                ","
                            )
                        }'"
                    )
                )
            }
        }
        
        // remove redundant selections when two or more iBus conditions are the same
        return iBusSelector
            .map { it.first }
            .toSet()
            .mapNotNull { a -> iBusSelector.find { it.first == a }?.second }
    }

    private fun getCombinationOfIndexes(
        combination: List<String>,
        iBusConditions: List<String>
    ) = combination.flatMap { entry ->
        val indexList = mutableListOf<Int>()
        var currentIndex = iBusConditions.indexOf(entry)
        while (currentIndex != -1) {
            indexList.add(currentIndex)
            currentIndex = iBusConditions.indexOfFirst(currentIndex + 1) { it == entry }
        }
        indexList
    }.toSet()

    private fun List<String>.combinations(length: Int): List<List<String>> {
        if (length > size) return emptyList()
        if (length == 0) return listOf(emptyList())

        val result = mutableListOf<List<String>>()

        for (i in indices) {
            val element = this[i]
            val remaining = subList(i + 1, size)
            val combinations = remaining.combinations(length - 1)
            for (combination in combinations) {
                result.add(listOf(element) + combination)
            }
        }

        return result
    }

    fun getNumberOfPublishableDocuments(catalogId: String, category: String, catalogProfile: CatalogProfile): Long {
        val iBusConditions = getSystemSpecificConditions()
        val sql = createSqlForPublishedDocuments(catalogProfile, catalogId, iBusConditions, category, null)
        val regex = Regex("(.|\\n)*?\\bFROM\\b")
        val countSql = sql.replaceFirst(regex, "SELECT COUNT(*) FROM")
        val nativeQuery = entityManager.createNativeQuery(countSql)

        nativeQuery.setParameter(1, catalogId)

        return (nativeQuery.singleResult as Number).toLong()
    }
}

data class IndexDocumentResult(
    val uuid: String,
    val wrapperId: Int,
    val type: String,
    val ibus: String
)