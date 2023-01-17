package de.ingrid.igeserver.exports.interfaces.dcat

import de.ingrid.igeserver.exporter.model.AddressModel

interface DCAT {

    val uuid: String
    val title: String
    val distributions: List<Download>?
    val description: String?
    val publisher: AddressModel?
    val license: String?

}
