package de.ingrid.igeserver.exporter

import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exporter.model.KeyValueModel

class AddressModelTransformer(
    val model: AddressModel,
    val codelist: CodelistTransformer,
    val type: KeyValueModel? = null,
) {

    fun getIndividualName(): String? {

        // format: "lastName, firstName, salutation academicTitle"
        val salutation = codelist.getValue("4300", model.salutation)
        val academicTitle = codelist.getValue("4305", model.academicTitle)
        val namePostFix = listOfNotNull(salutation, academicTitle).joinToString(" ")
        val individualName = listOfNotNull(model.lastName, model.firstName, namePostFix).joinToString(", ")

        return individualName.ifBlank { null }
    }

    val postBoxAddress = listOfNotNull( model.address.poBox, model.address.zipPoBox).joinToString(", ")
    val country = model.address.country?.let { TransformationTools.getISO3166_1_Alpha_3FromNumericLanguageCode(it) }
    val positionName = model.positionName
    val zipCode = model.address.zipCode
    val street = model.address.street
    val city = model.address.city
    val administrativeArea = codelist.getValue("110", model.address.administrativeArea)
    val addressDocType = if (model.docType == "InGridOrganisationDoc") 0 else 1


}

