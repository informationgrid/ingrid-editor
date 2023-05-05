package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import jakarta.persistence.*

@NoArgs
@Entity
@Table(name = "version_info")
class VersionInfo {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @field:JsonProperty("db_id")
    var id: Int? = null

    @Column()
    var key: String? = null

    @Column()
    var value: String? = null

}
