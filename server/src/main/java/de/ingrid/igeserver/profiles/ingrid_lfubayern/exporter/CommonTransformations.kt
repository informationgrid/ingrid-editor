package de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exporter.model.CharacterStringModel
import de.ingrid.igeserver.exports.iso.DescriptiveKeyword
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer.UseConstraintTemplate
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty

fun lfubUseConstraints(superUseConstraints: List<UseConstraintTemplate>, docData: JsonNode): List<UseConstraintTemplate> {
    val comments = docData.getString("resource.useConstraintsComments")
    if (comments.isNullOrEmpty()) return superUseConstraints
    return if (superUseConstraints.isNotEmpty()) {
        superUseConstraints.apply {
            get(0).note = docData.getStringOrEmpty("resource.useConstraintsComments")
        }
    } else {
        listOf(
            UseConstraintTemplate(
                CharacterStringModel(docData.getStringOrEmpty("resource.useConstraintsComments"), null),
                null,
                null,
                null
            )
        )
    }
}

fun lfubGetDescriptiveKeywords(superDescriptiveKeywords: List<Thesaurus>, docData: JsonNode): List<Thesaurus> {
    val lfuInternalKeywords = Thesaurus(
        "LfU Internal Keywords",
        "2024-07-01",
        keywords = docData.get("keywords").get("internalKeywords")?.map { KeywordIso(it.asText()) } ?: emptyList(),
    )
    val lfugeoKeywords = Thesaurus(
        "LfU Geological Keywords",
        "2018-08-01",
        type = "stratum",
        dateType = "revision",
        keywords = docData.get("keywords").get("geologicalKeywords")?.map { KeywordIso(it.asText()) }
            ?: emptyList(),
    )
    return superDescriptiveKeywords + lfuInternalKeywords + lfugeoKeywords
}