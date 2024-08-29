/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.*
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateSerializer
import jakarta.persistence.*
import jakarta.persistence.Table
import org.hibernate.annotations.*
import org.hibernate.type.SqlTypes
import java.time.OffsetDateTime
import java.util.*

@Entity
@Table(name = "document_wrapper")
@Where(clause = "deleted = 0")
class DocumentWrapper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    var id: Int? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var catalog: Catalog? = null

    // must be named "id" since getId() method is used for ACL permissions!
    @Column(name = "uuid", nullable = false)
    var uuid: String = UUID.randomUUID().toString()

    @Column(nullable = false)
    @JsonProperty("_type")
    lateinit var type: String

    @Column(nullable = false)
    @JsonProperty("_category")
    var category: String? = null

    /**
     * Parent relation (many-to-one)
     * NOTE Since the JSON representation contains a document wrapper uuid ('parent') only, we need
     * to map it manually to the document wrapper instance for persistence
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonAlias("_parent") // hint for model registry
    @JsonIgnore
    var parent: DocumentWrapper? = null

    @Transient
    @JsonSetter("_parent")
    private var parentUuid: String? = null

    /*    @JsonIgnore
        private var parentId: Int? = null*/

    @JsonGetter("_parent")
    fun getParentUuid(): String? {
        if (this.parentUuid == null) {
            this.parentUuid = parent?.uuid
        }
        return this.parentUuid
    }

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(
        name = "path",
        columnDefinition = "text[]",
    )
    var path: List<Int> = emptyList()
        get() = if (field == null) emptyList() else field // field can actually be null if in db table null

    @Formula(value = "(select count(dw.id) from document_wrapper dw where dw.parent_id = id and dw.deleted = 0)")
    var countChildren: Int = 0

    @Column(name = "deleted")
    var deleted = 0

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tags", columnDefinition = "text[]")
    var tags: List<String> = emptyList()
        get() = field ?: emptyList() // field can actually be null if in db table null

    @Column
    @JsonSerialize(using = DateSerializer::class)
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("pending_date")
    var pending_date: OffsetDateTime? = null

    @JdbcTypeCode(SqlTypes.JSON)
    var fingerprint: List<FingerprintInfo>? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_user", nullable = true)
    @JsonIgnore
    var responsibleUser: UserInfo? = null

    @Column
    @JsonIgnore
    var last_expiry_time: OffsetDateTime? = null

    @Column
    @JsonIgnore
    var expiry_state: Int? = 0

    @Transient
    var hasWritePermission: Boolean = true

    @Transient
    var hasOnlySubtreeWritePermission: Boolean = false
}

data class FingerprintInfo(val exportType: String, val fingerprint: String, val date: OffsetDateTime)
