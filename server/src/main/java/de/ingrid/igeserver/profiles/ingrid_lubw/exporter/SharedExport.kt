package de.ingrid.igeserver.profiles.ingrid_lubw.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid_lubw.exporter.tranformer.GeodatasetTransformerLubw
import de.ingrid.igeserver.utils.getString
import kotlin.reflect.KClass


fun getLubwModelTransformerClass(docType: String): KClass<out Any>? {
    return when (docType) {
        "InGridGeoDataset" -> GeodatasetTransformerLubw::class
        else -> null
    }
}

fun amendLubwDescriptiveKeywords(
    docData: JsonNode,
    previousKeywords: List<Thesaurus>
): List<Thesaurus> {
    val oac = docData.getString("oac")

    val keywords = previousKeywords.toMutableList()

    if (oac.isNullOrEmpty().not()) {
        keywords += Thesaurus(
            keywords = listOf( KeywordIso(
                name = "oac: $oac",
            )),
        )
    }
    return keywords
}

