package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateSerializer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.IgeEntity
import org.hibernate.annotations.Type
import java.time.OffsetDateTime
import javax.persistence.*

@NoArgs
@Entity
@Table(name = "query")
class Query : IgeEntity(), EntityWithCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @field:JsonProperty("id")
    override var id: Int? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    @JsonIgnore
    override var catalog: Catalog? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnore
    var user: UserInfo? = null

    @Column(nullable = false)
    var name: String? = null

    @Column(nullable = false)
    var category: String? = null

    @Column
    var description: String? = null
    
    @Column
    @JsonSerialize(using= DateSerializer::class)
    @JsonDeserialize(using= DateDeserializer::class)
    @JsonProperty("modified")
    var modified: OffsetDateTime? = null

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    @JsonProperty("settings")
    var data: JsonNode? = null

}