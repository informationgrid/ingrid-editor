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

    val country = model.address.country?.let { TransformationTools.getISO3166_1_Alpha_3FromNumericLanguageCode(it) }
//    val administrativeArea = codelist.getValue("6250", model.address.administrativeArea)
    val administrativeArea = model.address.administrativeArea.let { codelist.getValue("6250", it) }


}

