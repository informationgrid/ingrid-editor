package de.ingrid.igeserver.persistence.postgresql.jpa.mapping

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import org.hibernate.engine.spi.SharedSessionContractImplementor
import org.hibernate.usertype.UserType
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.io.*
import java.sql.PreparedStatement
import java.sql.ResultSet
import java.sql.Types

/**
 * Hibernate UserType for storing and receiving de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData instances
 * in and from the database.
 *
 * When storing EmbeddedData instances the ObjectMapper.writeValue() method is used to serialize the content into a JSON
 * string. The type of the original EmbeddedData is NOT stored in this string. This implies that the deserialization process
 * needs to use additional information from the received database ResultSet to select the matching EmbeddedData implementation.
 * This information MUST be stored in the "type" column value which is used to match against the "typeColumnValue" property
 * of all known EmbeddedData implementations.
 *
 * NOTE The registry for known EmbeddedData implementations is injected into a Spring managed instance by using the @Autowired
 * annotation. This instance stores the registry in the companion object to make it available to all (Non-Spring managed) instances
 * that are created by Hibernate.
 */
@Component
class EmbeddedDataUserType : UserType {

    companion object {
        private var embeddedDataTypes: EmbeddedDataTypeRegistry? = null

        private val mapper: ObjectMapper by lazy {
            val mapper = jacksonObjectMapper()
            mapper.findAndRegisterModules()
            mapper
        }
    }

    /**
     * This property will be set during Spring initialization
     */
    @Autowired
    fun setEmbeddedDataTypeRegistry(embeddedDataTypes: EmbeddedDataTypeRegistry) {
        // set companion property to be used by all instances
        Companion.embeddedDataTypes = embeddedDataTypes
    }

    private fun getEmbeddedDataType(rs: ResultSet): EmbeddedData {
        if (embeddedDataTypes == null) {
            throw PersistenceException.withReason("Data type registry not initialized.")
        }
        // get alias name of type column
        val meta = rs.metaData
        var typeColumnIndex: Int? = null
        for (i in 1..meta.columnCount) {
            val name = meta.getColumnName(i)
            if (name.startsWith("type")) {
                typeColumnIndex = i
                break
            }
        }
        // get type name (null will result in EmbeddedMap)
        val type = if (typeColumnIndex != null) rs.getString(typeColumnIndex) else null
        return embeddedDataTypes!!.getType(type)
    }

    /**
     * UserType implementation
     */

    override fun sqlTypes(): IntArray {
        return intArrayOf(Types.JAVA_OBJECT)
    }

    override fun returnedClass(): Class<Any> {
        return Any::class.java
    }

    override fun nullSafeGet(rs: ResultSet, names: Array<out String>, session: SharedSessionContractImplementor, owner: Any): Any? {
        val value = rs.getString(names[0]) ?: return null
        val type = getEmbeddedDataType(rs)
        return try {
            mapper.readValue(value.toByteArray(charset("UTF-8")), type::class.java)
        }
        catch (ex: Exception) {
            throw PersistenceException.withReason("Failed to convert string to EmbeddedData of type '$type': ${ex.message}", ex)
        }
    }

    override fun nullSafeSet(st: PreparedStatement, value: Any?, index: Int, session: SharedSessionContractImplementor) {
        if (value == null) {
            st.setNull(index, Types.OTHER)
            return
        }
        try {
            val w = StringWriter()
            mapper.writeValue(w, value)
            w.flush()
            st.setObject(index, w.toString(), Types.OTHER)
        } catch (ex: java.lang.Exception) {
            throw PersistenceException.withReason("Failed to convert EmbeddedData to string: ${ex.message}", ex)
        }
    }

    override fun deepCopy(value: Any?): Any {
        return try {
            // use serialization to create a deep copy
            val bos = ByteArrayOutputStream()
            val oos = ObjectOutputStream(bos)
            oos.writeObject(value)
            oos.flush()
            oos.close()
            bos.close()
            ObjectInputStream(ByteArrayInputStream(bos.toByteArray())).readObject()
        } catch (ex: java.lang.Exception) {
            throw PersistenceException.withReason("Failed to make a deep copy of EmbeddedData: " + ex.message, ex)
        }
    }

    override fun isMutable(): Boolean {
        return true
    }

    override fun disassemble(value: Any?): Serializable? {
        return (deepCopy(value) as Serializable)
    }

    override fun assemble(cached: Serializable?, owner: Any): Any {
        return this.deepCopy(cached)
    }

    override fun replace(original: Any?, target: Any?, owner: Any): Any {
        return this.deepCopy(original)
    }

    override fun equals(x: Any?, y: Any?): Boolean {
        if (x == null) {
            return y == null
        }
        return x == y
    }

    override fun hashCode(x: Any): Int {
        return x.hashCode()
    }
}