package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.CriteriaQuery
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import org.springframework.data.jpa.domain.Specification

class DocumentWrapperSpecification(val filter: DocumentWrapper): Specification<DocumentWrapper> {
    
    
    
    override fun toPredicate(
        root: Root<DocumentWrapper>,
        query: CriteriaQuery<*>,
        cb: CriteriaBuilder
    ): Predicate? {

        val p: Predicate = cb.disjunction()

        /*if (filter.category != null) {
            p.expressions
                .add(cb.equal(root["category"] as String, filter.category))
        }*/

        return p
        
    }
}