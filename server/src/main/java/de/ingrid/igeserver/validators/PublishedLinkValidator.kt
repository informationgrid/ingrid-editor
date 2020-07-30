package de.ingrid.igeserver.validators;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import de.ingrid.igeserver.annotations.PublishedLink;

public class PublishedLinkValidator implements ConstraintValidator<PublishedLink, String> {

    @SuppressWarnings("unused")
    private String link;

    @Override
    public void initialize(PublishedLink constraintAnnotation) {
        this.link = constraintAnnotation.value();

    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return false;
    }

}
