package de.ingrid.igeserver.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;

import de.ingrid.igeserver.validators.PublishedLinkValidator;

@Documented
@Constraint(validatedBy = PublishedLinkValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface PublishedLink {
    // String message() default "{com.example.beanvalidationcustomconstraint.PublishedLink.message}";
    String message() default "One or more document links are not published.";
    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    String value();
}
