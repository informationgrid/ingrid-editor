package de.ingrid.igeserver.services

import com.fasterxml.jackson.dataformat.xml.XmlMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.validation.DocUVP
import javax.validation.ConstraintViolation
import javax.validation.Validation
import javax.validation.Validator

//@Service
class DocValidator : MapperService() {

    private val validator: Validator

    private fun test() {
        val xmlMapper = XmlMapper()
        val node = xmlMapper.readValue(javaClass.getResourceAsStream("/csw_test_import_example.xml"), Any::class.java)
        val jsonMapper = jacksonObjectMapper()
        val json = jsonMapper.writeValueAsString(node)
        println(json)
    }

    fun run(json: String): Set<ConstraintViolation<Any>> {
        val profile = getJsonNode(json)["_profile"].asText()
        var validatorBeanClass: Class<*>? = null
        when (profile) {
            "UVP" -> validatorBeanClass = DocUVP::class.java
        }
        val data = jacksonObjectMapper()
            .readValue(json, validatorBeanClass)
     
        return validator.validate(data)
    }

    init {
        val factory = Validation.buildDefaultValidatorFactory()
        validator = factory.validator
    }
}
