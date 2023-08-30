package de.ingrid.igeserver.exporter

import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exporter.model.KeyValueModel

class AddressModelTransformer(
    private val model: AddressModel,
    val catalogIdentifier: String,
    val codelist: CodelistTransformer,
    val type: KeyValueModel? = null,
) {
    private var displayAddress: AddressModel
    fun getModel() = displayAddress

    init {
        displayAddress = determineDisplayAddress()
    }

    fun getIndividualName(): String? {

        // format: "lastName, firstName, salutation academicTitle"
        val salutation = codelist.getValue("4300", displayAddress.salutation)
        val academicTitle = codelist.getValue("4305", displayAddress.academicTitle)
        val namePostFix = listOfNotNull(salutation, academicTitle).joinToString(" ")
        val individualName =
            listOfNotNull(displayAddress.lastName, displayAddress.firstName, namePostFix).joinToString(", ")

        return individualName.ifBlank { null }
    }

    private fun determineDisplayAddress(): AddressModel {
        val nonHiddenAddress = model.getAncestorAddressesIncludingSelf(model.id, catalogIdentifier)

        return if (nonHiddenAddress.size > 0) {
            nonHiddenAddress.last()
        } else model

    }

    val uuid = displayAddress.uuid
    val namePresentation = displayAddress.organization ?: getIndividualName()
    val organization = displayAddress.organization // TODO calc organization name
    val hoursOfService = displayAddress.hoursOfService
    val postBoxAddress = listOfNotNull(displayAddress.address.poBox, displayAddress.address.zipPoBox).joinToString(", ")
    val country =
        displayAddress.address.country?.let { TransformationTools.getISO3166_1_Alpha_3FromNumericLanguageCode(it) }
    val positionName = displayAddress.positionName // TODO calc position name
    val zipCode = displayAddress.address.zipCode
    val zipPoBox = displayAddress.address.zipPoBox
    val poBox = displayAddress.address.poBox
    val street = displayAddress.address.street
    val city = displayAddress.address.city
    val email = displayAddress.email

    val administrativeArea = codelist.getCatalogCodelistValue("6250", displayAddress.address.administrativeArea)
    val addressDocType = if (displayAddress.docType == "InGridOrganisationDoc") 0 else 2


}

