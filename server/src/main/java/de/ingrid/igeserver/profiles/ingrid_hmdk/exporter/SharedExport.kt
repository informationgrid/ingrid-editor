package de.ingrid.igeserver.profiles.ingrid_hmdk.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.mapToKeyValue

class SharedExport(
    private val codelists: CodelistTransformer,
    private val doc: Document
) {

    fun amendHMDKDescriptiveKeywords(previousKeywords: List<Thesaurus>): List<Thesaurus> {
        val docData = doc.data

        val publicationHmbTG = docData.getBoolean("publicationHmbTG") ?: false
        val informationHmbTG = docData.get("informationHmbTG")
            ?.mapNotNull { it.mapToKeyValue() }
            ?.map { KeyValue(it.key, codelists.getCatalogCodelistValue("informationsgegenstand", it)) }
            ?: emptyList()

        val keywords = previousKeywords.toMutableList()

        if (informationHmbTG.isNotEmpty()) {
            keywords += Thesaurus(
                keywords = informationHmbTG.map { KeywordIso(it.key) },
                date = "2013-08-02",
                name = "HmbTG-Informationsgegenstand",
                link = "http://www.tc211.org/ISO19139/resources/codeList.xml#MD_KeywordTypeCode",
                showType = false
            )
            keywords += Thesaurus(keywords = informationHmbTG.map { KeywordIso(it.value) })
        }

        if (publicationHmbTG)
            keywords += Thesaurus(keywords = listOf(KeywordIso(name = "hmbtg", link = null)))

        return keywords
    }

}