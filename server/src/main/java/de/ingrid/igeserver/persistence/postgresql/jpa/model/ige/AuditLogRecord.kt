/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.persistence.postgresql.model.meta.AuditLogRecordData
import io.hypersistence.utils.hibernate.type.json.JsonType
import jakarta.persistence.*
import org.hibernate.annotations.Type

@Entity
@Table(name = "audit_log")
class AuditLogRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    var id: Int? = null

    @Column(nullable = false)
    @JsonProperty("_type")
    var type: String? = null

    @Type(JsonType::class)
    @Column(name = "message", columnDefinition = "jsonb")
    var message: AuditLogRecordData? = null

    @Column
    var file: String? = null

    @Column(name = "class")
    @JsonProperty("class")
    var clazz: String? = null

    @Column
    var method: String? = null

    @Column
    var line: String? = null

    @Column
    var logger: String? = null

    @Column
    var thread: String? = null

    @Column
    var level: String? = null

    @Column
    var timestamp: String? = null
}