package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import java.util.*
import javax.persistence.*

@NoArgs
@Entity
@Table(name = "version_info")
class VersionInfo : EntityBase() {

    @Column()
    var key: String? = null

    @Column()
    var value: String? = null

}
