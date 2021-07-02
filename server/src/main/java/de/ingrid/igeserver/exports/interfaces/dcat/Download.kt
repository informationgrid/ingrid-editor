package de.ingrid.igeserver.exports.interfaces.dcat

interface Download {

    val link: LinkType?

}

interface LinkType {
    val asLink: Boolean?
    val value: String?
}