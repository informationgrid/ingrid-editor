package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.*
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import javax.persistence.*
import java.io.Serializable

// https://stackoverflow.com/questions/38934436/join-3-tables-hibernate-jpa

@Embeddable
class AssignmentKey : Serializable {
    @Column(name="catalog_id")
    var catalogId: Int = 0

    @Column(name="manager_id")
    var managerId: Int = 0

    @Column(name="user_id")
    var userId: Int = 0
    
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as AssignmentKey

        if (catalogId != other.catalogId) return false
        if (managerId != other.managerId) return false
        if (userId != other.userId) return false

        return true
    }

    override fun hashCode(): Int {
        var result = catalogId
        result = 31 * result + managerId
        result = 31 * result + userId
        return result
    }
}

@NoArgs
@Entity
@Table(name="manager")
class CatalogManagerAssignment : EntityWithCatalog  {

    @EmbeddedId
    var id: AssignmentKey? = null

    @ManyToOne(fetch=FetchType.LAZY)
    @MapsId("catalogId")
    @JoinColumn(name="catalog_id", nullable=false)
    @JsonIgnore
    override var catalog: Catalog? = null

    @ManyToOne(fetch=FetchType.LAZY)
    @MapsId("managerId")
    @JoinColumn(name="manager_id", nullable=false)
    @JsonIgnore
    var manager: UserInfo? = null

    @ManyToOne(fetch=FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name="user_id", nullable=false)
    @JsonIgnore
    var user: UserInfo? = null
}