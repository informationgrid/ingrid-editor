package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateSerializer
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.utils.SpringContext
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import org.hibernate.annotations.Type
import java.time.OffsetDateTime
import java.util.*
import javax.persistence.*
import kotlin.jvm.Transient

@Entity
@Table(name="catalog")
class Catalog {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @JsonProperty("db_id")
    var id: Int? = null
    
    @Column(nullable=false)
    @JsonProperty("id")
    lateinit var identifier: String

    // TODO: make type non null
    @Column(nullable=false)
    lateinit var type: String

    @Column(nullable=false)
    lateinit var name: String

    @Column
    var description: String? = null

    @Column
    @JsonSerialize(using= DateSerializer::class)
    @JsonDeserialize(using= DateDeserializer::class)
    var created: OffsetDateTime? = null

    @Column
    @JsonSerialize(using= DateSerializer::class)
    @JsonDeserialize(using= DateDeserializer::class)
    var modified: OffsetDateTime? = null

    @ManyToMany(mappedBy="catalogs", fetch= FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var users: MutableSet<UserInfo> = LinkedHashSet<UserInfo>()

    @Type(type = "jsonb")
    @Column(name = "settings", columnDefinition = "jsonb")
    var settings: CatalogSettings? = CatalogSettings()
    
    @PrePersist
    fun setPersistDate() {
        created = dateService?.now()
        modified = created
    }

    @PreUpdate
    fun setUpdateDate() {
        modified = dateService?.now()
    }
    
    companion object {
        private val dateService: DateService? by lazy {
            SpringContext.getBean(DateService::class.java)
        }
    }

}
