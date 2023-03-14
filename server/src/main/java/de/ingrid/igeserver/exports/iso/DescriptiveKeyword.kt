package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

data class DescriptiveKeyword(
    @JacksonXmlProperty(localName = "MD_Keywords") val keywords: MDKeywords?
)

data class MDKeywords(
    val keyword: List<CharacterString>,
    val type: MDKeywordTypeCode?,
    val thesaurusName: Citation?
)

data class MDKeywordTypeCode(
    @JacksonXmlProperty(localName = "MD_KeywordTypeCode") val codelist: CodelistAttributes?
)