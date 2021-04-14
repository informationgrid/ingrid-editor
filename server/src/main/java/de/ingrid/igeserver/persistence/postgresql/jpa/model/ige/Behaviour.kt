package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import org.hibernate.annotations.Type
import javax.persistence.*

@Entity
@Table(name = "behaviour")
class Behaviour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    var id: Int? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    @JsonIgnore
    var catalog: Catalog? = null

    @Column(nullable = false, unique = true)
    @JsonProperty("_id")
    var name: String? = null

    @Column(nullable = false)
    var active: Boolean? = null

    @Type(type = "embeddedData")
    @Column(name = "data", columnDefinition = "jsonb")
    var data: Map<String, *>? = null

}