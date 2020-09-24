package de.ingrid.igeserver.exports.interfaces.dcat

import de.ingrid.igeserver.profiles.mcloud.exporter.model.AddressModel

interface DCAT {

    val uuid: String
    val title: String
    val downloads: List<Download>?
    val description: String?
    val publisher: AddressModel?
    val license: String?

}