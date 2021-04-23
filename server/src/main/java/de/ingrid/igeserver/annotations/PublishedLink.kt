package de.ingrid.igeserver.annotations

import de.ingrid.igeserver.validators.PublishedLinkValidator
import javax.validation.Constraint
import javax.validation.Payload
import kotlin.reflect.KClass

@MustBeDocumented
@Constraint(validatedBy = [PublishedLinkValidator::class])
@Target(AnnotationTarget.FIELD)
@Retention(AnnotationRetention.RUNTIME)
annotation class PublishedLink( // String message() default "{com.example.beanvalidationcustomconstraint.PublishedLink.message}";
    val message: String = "One or more document links are not published.",
    val groups: Array<KClass<*>> = [],
    val payload: Array<KClass<out Payload>> = [],
    val value: String
)
