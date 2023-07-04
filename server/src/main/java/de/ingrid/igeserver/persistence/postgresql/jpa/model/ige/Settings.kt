package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import de.ingrid.igeserver.annotations.NoArgs
import io.hypersistence.utils.hibernate.type.json.JsonType
import jakarta.persistence.*
import org.hibernate.annotations.Type

@NoArgs
@Entity
@Table(name = "settings")
class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null

    @Column()
    var key: String? = null

    @Type(JsonType::class)
    @Column(name = "value", columnDefinition = "jsonb")
    var value: Any? = null

}
