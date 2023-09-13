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

    fun getIndividualName(useDisplayAddress: Boolean): String? {
        val address = if (useDisplayAddress) displayAddress else model

        // format: "lastName, firstName, salutation academicTitle"
        val salutation = codelist.getValue("4300", address.salutation)
        val academicTitle = codelist.getValue("4305", address.academicTitle)
        val namePostFix = listOfNotNull(salutation, academicTitle).joinToString(" ")
        val individualName =
            listOfNotNull(address.lastName, address.firstName, namePostFix).joinToString(", ")

        return individualName.ifBlank { null }
    }

    fun getIndividualName(): String? = getIndividualName(true)

    fun getOrganization(): String? =
        if (displayAddress.organization.isNullOrEmpty()) determineEldestAncestor()?.organization else displayAddress.organization

    fun getPositionName(): String? =
        if (displayAddress.positionName.isNullOrEmpty()) determinePositionNameFromAncestors() else displayAddress.positionName


    private fun determineDisplayAddress(): AddressModel {
        val nonHiddenAddress = model.getAncestorAddressesIncludingSelf(model.id, catalogIdentifier)

        return if (nonHiddenAddress.size > 0) {
            nonHiddenAddress.last()
        } else model
    }

    fun getHierarchy(): List<AddressModelTransformer> =
        model.getAncestorAddressesIncludingSelf(model.id, catalogIdentifier).map {
            AddressModelTransformer(
                it,
                catalogIdentifier,
                codelist
            )
        }.reversed()

    private fun determineEldestAncestor(): AddressModel? =
        model.getAncestorAddressesIncludingSelf(model.id, catalogIdentifier).firstOrNull()

    private fun determinePositionNameFromAncestors(): String {
        val ancestorsWithoutEldest = model.getAncestorAddressesIncludingSelf(model.id, catalogIdentifier).drop(1)
        return ancestorsWithoutEldest.filter { !it.positionName.isNullOrEmpty() }.map { it.positionName }
            .joinToString(", ")
    }

    val uuid = displayAddress.uuid
    val hoursOfService = displayAddress.hoursOfService
    val country =
        displayAddress.address.country?.let { TransformationTools.getISO3166_1_Alpha_3FromNumericLanguageCode(it) }
    val zipCode = displayAddress.address.zipCode
    val zipPoBox = displayAddress.address.zipPoBox
    val poBox = displayAddress.address.poBox
    val street = displayAddress.address.street
    val city = displayAddress.address.city
    val email = displayAddress.email
    val postBoxAddress =
        listOfNotNull(
            this.poBox?.let { "Postfach $it" },
            this.zipPoBox?.let { it + this.city?.let { " $it" } }).filter { it.isNotEmpty() }
            .joinToString(", ")
    val homepage = displayAddress.homepage
    val telephone = displayAddress.telephone
    val fax = displayAddress.fax

    val administrativeArea = codelist.getCatalogCodelistValue("6250", displayAddress.address.administrativeArea)
    val addressDocType = if (displayAddress.docType == "InGridOrganisationDoc") 0 else 2


}

