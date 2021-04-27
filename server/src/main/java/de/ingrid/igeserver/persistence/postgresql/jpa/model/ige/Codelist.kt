package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.JsonNode
import org.hibernate.annotations.Type
import javax.persistence.*

@Entity
@Table(name = "codelist")
class Codelist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    var id: Int? = null

    @Column(nullable = false)
    @JsonProperty("id")
    lateinit var identifier: String

    @Column()
    var name: String? = null

    @Column()
    var description: String? = null

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    @JsonProperty("entries")
    var data: JsonNode? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    @JsonIgnore
    var catalog: Catalog? = null
    
    @Column
    var defaultEntry: String? = null

}