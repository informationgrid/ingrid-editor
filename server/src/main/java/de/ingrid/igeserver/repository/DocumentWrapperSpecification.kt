package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.springframework.data.jpa.domain.Specification
import javax.persistence.criteria.CriteriaBuilder
import javax.persistence.criteria.CriteriaQuery
import javax.persistence.criteria.Predicate
import javax.persistence.criteria.Root

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