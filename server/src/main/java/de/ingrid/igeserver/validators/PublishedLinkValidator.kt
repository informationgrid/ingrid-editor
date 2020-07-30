package de.ingrid.igeserver.validators

import de.ingrid.igeserver.annotations.PublishedLink
import javax.validation.ConstraintValidator
import javax.validation.ConstraintValidatorContext

class PublishedLinkValidator : ConstraintValidator<PublishedLink, String?> {
    private var link: String? = null
    override fun initialize(constraintAnnotation: PublishedLink) {
        link = constraintAnnotation.value
    }

    override fun isValid(value: String?, context: ConstraintValidatorContext): Boolean {
        return false
    }
}