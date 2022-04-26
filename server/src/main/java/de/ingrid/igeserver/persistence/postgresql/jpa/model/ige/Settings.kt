package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import de.ingrid.igeserver.annotations.NoArgs
import org.hibernate.annotations.Type
import javax.persistence.*

@NoArgs
@Entity
@Table(name = "settings")
class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null

    @Column()
    var key: String? = null

    @Type(type = "jsonb")
    @Column(name = "value", columnDefinition = "jsonb")
    var value: Any? = null

}
