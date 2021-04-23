package de.ingrid.igeserver.model

import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.model.InlineResponseDefault
import java.lang.StringBuilder
import java.util.*

/**
 * InlineResponseDefault
 */
class InlineResponseDefault {
    /**
     * Get code
     * @return code
     */
    @JsonProperty("code")
    var code: Int? = null

    /**
     * Get message
     * @return message
     */
    @JsonProperty("message")
    var message: String? = null

    /**
     * Get fields
     * @return fields
     */
    @JsonProperty("fields")
    var fields: String? = null
    fun code(code: Int?): InlineResponseDefault {
        this.code = code
        return this
    }

    fun message(message: String?): InlineResponseDefault {
        this.message = message
        return this
    }

    fun fields(fields: String?): InlineResponseDefault {
        this.fields = fields
        return this
    }

    override fun equals(o: Any?): Boolean {
        if (this === o) {
            return true
        }
        if (o == null || javaClass != o.javaClass) {
            return false
        }
        val inlineResponseDefault = o as InlineResponseDefault
        return code == inlineResponseDefault.code &&
                message == inlineResponseDefault.message &&
                fields == inlineResponseDefault.fields
    }

    override fun hashCode(): Int {
        return Objects.hash(code, message, fields)
    }

    override fun toString(): String {
        val sb = StringBuilder()
        sb.append("class InlineResponseDefault {\n")
        sb.append("    code: ").append(toIndentedString(code)).append("\n")
        sb.append("    message: ").append(toIndentedString(message)).append("\n")
        sb.append("    fields: ").append(toIndentedString(fields)).append("\n")
        sb.append("}")
        return sb.toString()
    }

    /**
     * Convert the given object to string with each line indented by 4 spaces
     * (except the first line).
     */
    private fun toIndentedString(o: Any?): String {
        return o?.toString()?.replace("\n", "\n    ") ?: "null"
    }
}
