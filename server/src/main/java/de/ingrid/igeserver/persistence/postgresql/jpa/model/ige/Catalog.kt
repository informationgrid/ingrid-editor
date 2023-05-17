package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.vladmihalcea.hibernate.type.json.JsonType
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateSerializer
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.utils.SpringContext
import jakarta.persistence.*
import jakarta.persistence.Table
import org.hibernate.annotations.*
import java.time.OffsetDateTime
import java.util.*

@Entity
@Table(name = "catalog")
class Catalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("db_id")
    var id: Int? = null

    @Column(nullable = false)
    @JsonProperty("id")
    var identifier: String = "n/a"

    // TODO: make type non null
    @Column(nullable = false)
    var type: String = "n/a"

    @Column(nullable = false)
    var name: String = "n/a"

    @Column
    var description: String? = null

    @Column
    @JsonSerialize(using = DateSerializer::class)
    @JsonDeserialize(using = DateDeserializer::class)
    var created: OffsetDateTime? = null

    @Column
    @JsonSerialize(using = DateSerializer::class)
    @JsonDeserialize(using = DateDeserializer::class)
    var modified: OffsetDateTime? = null

    @Type(JsonType::class)
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
