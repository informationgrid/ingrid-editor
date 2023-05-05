package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.JsonNode
import com.vladmihalcea.hibernate.type.json.JsonType
import jakarta.persistence.*
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import org.hibernate.annotations.Type

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

    @Type(JsonType::class)
    @Column(columnDefinition = "jsonb")
    @JsonProperty("entries")
    var data: JsonNode? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var catalog: Catalog? = null
    
    @Column
    var defaultEntry: String? = null

}