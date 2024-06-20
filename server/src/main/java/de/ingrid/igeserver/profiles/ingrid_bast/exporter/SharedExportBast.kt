package de.ingrid.igeserver.profiles.ingrid_bast.exporter

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.utils.getString

fun getBastKeywords(docData: ObjectNode): Thesaurus {
    return Thesaurus("BASt Keywords", "2024-01-01", showType = false, keywords = listOfNotNull(
        docData.getString("projectNumber")?.let { KeywordIso(it) },
        docData.getString("projectTitle")?.let { KeywordIso(it) }
    ))
}