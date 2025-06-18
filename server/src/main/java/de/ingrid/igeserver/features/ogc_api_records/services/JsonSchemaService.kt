package de.ingrid.igeserver.features.ogc_api_records.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.filter.publish.PreJsonSchemaValidator
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.stereotype.Service
import java.net.URI
import kotlin.collections.component1
import kotlin.collections.component2
import kotlin.collections.iterator

@Service
class JsonSchemaService(
    private val catalogService: CatalogService,
    private val documentService: DocumentService,
) {

    fun getSchemaOfDocType(catalogId: String, docType: String, isDraft: Boolean): JsonNode {
        val profile = catalogService.getProfileFromCatalog(catalogId)
        val docType = documentService.getDocumentType(docType, profile.identifier, null)
        val schemaPath = docType.jsonSchema
        val resource = PreJsonSchemaValidator::class.java.getResource(schemaPath as String)
            ?: error("Schema file not found: $schemaPath")

        val baseUri = resource.toURI()
        val rootSchema = ObjectMapper().readTree(resource)

        val completeJsonSchema = resolveAllRefs(rootSchema, baseUri)

        return if (isDraft) {
            removeRequiredConstraints(completeJsonSchema)
        } else {
            completeJsonSchema
        }
    }

    private fun resolveAllRefs(node: JsonNode, baseUri: URI): JsonNode {
        return when (node) {
            is ObjectNode -> {
                if (node.has("\$ref")) {
                    val ref = node["\$ref"].asText()
                    val targetUri = if (ref.startsWith("#")) baseUri else baseUri.resolve(ref.substringBefore("#"))
                    val resolved = resolveRef(ref, baseUri)
                    return resolveAllRefs(resolved, targetUri)
                }

                node.deepCopy<ObjectNode>().apply {
                    fields().forEach { (field, value) ->
                        set<JsonNode>(field, resolveAllRefs(value, baseUri))
                    }
                }
            }

            is ArrayNode -> node.deepCopy<ArrayNode>().apply {
                for (i in 0 until size()) {
                    set(i, resolveAllRefs(get(i), baseUri))
                }
            }

            else -> node
        }
    }

    private fun resolveRef(ref: String, baseUri: URI): JsonNode {
        val (relativePath, fragment) = ref.split("#", limit = 2).let {
            it[0] to it.getOrNull(1)
        }

        val uri = if (relativePath.isEmpty()) baseUri else baseUri.resolve(relativePath)
        val rootNode = ObjectMapper().readTree(uri.toURL())

        return fragment?.let {
            val pointer = toJsonPointer(it)
            val resolved = rootNode.at(pointer)
            if (resolved.isMissingNode) error("Fragment not found: $ref (resolved from: $uri)")
            resolved
        } ?: rootNode
    }

    private fun toJsonPointer(fragment: String): String = fragment.split('/')
        .filter { it.isNotEmpty() }
        .joinToString("/", prefix = "/") { it.replace("~1", "/").replace("~0", "~") }

    fun removeRequiredConstraints(schemaNode: JsonNode): JsonNode {
        val copy = schemaNode.deepCopy<ObjectNode>()

        if (copy.has("required")) {
            copy.remove("required")
        }

        // Recurse into properties and definitions
        copy.get("properties")?.let {
            if (it is ObjectNode) {
                for ((key, defSchema) in it.fields()) {
                    val modifiedDef = removeRequiredConstraints(defSchema)
                    (it).set<JsonNode>(key, modifiedDef)
                }
            }
        }
        copy.get("definitions")?.let {
            if (it is ObjectNode) {
                for ((key, propSchema) in it.fields()) {
                    val modifiedProp = removeRequiredConstraints(propSchema)
                    (it).set<JsonNode>(key, modifiedProp)
                }
            }
        }
        return copy
    }
}
