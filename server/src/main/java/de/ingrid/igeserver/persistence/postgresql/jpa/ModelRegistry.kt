package de.ingrid.igeserver.persistence.postgresql.jpa

import com.fasterxml.jackson.annotation.JsonProperty
import com.google.common.collect.ImmutableSet
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import org.hibernate.metamodel.spi.MetamodelImplementor
import org.hibernate.persister.entity.AbstractEntityPersister
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.lang.reflect.ParameterizedType
import javax.annotation.PostConstruct
import javax.persistence.EntityManager
import javax.persistence.JoinColumn
import kotlin.reflect.KClass

/**
 * ModelRegistry provides mapping related information on entity types.
 */
@Component
class ModelRegistry {

    class TypeInfo(
            val name: String,
            val type: KClass<out EntityBase>,
            val tableName: String,
            val pkName: String = "id",
            val fields: Set<FieldInfo>
    ) {
        val relatedTypes: Map<KClass<out EntityBase>, Set<FieldInfo>> by lazy {
            val result: Map<KClass<out EntityBase>, Set<FieldInfo>> = mutableMapOf()
            fields.forEach { f ->
                if (f.isRelation) {
                    val type = f.relatedEntityType
                    if (type != null && !result.contains(type)) {
                        (result as MutableMap<KClass<out EntityBase>, Set<FieldInfo>>)[type] = mutableSetOf()
                    }
                    (result[type] as MutableSet<FieldInfo>).add(f)
                }
            }
            result
        }

        fun aliasName(i: Int = 1): String {
            return tableName.toLowerCase() + i.toString()
        }

        override fun toString(): String {
            return type.toString()
        }
    }

    class FieldInfo(
            val name: String,
            val type: Class<*>,
            val columnName: String,
            val jsonName: String,
            val relatedEntityType: KClass<out EntityBase>?,
            val fkName: String?,
    ) {
        val isRelation: Boolean
            get() = relatedEntityType != null

        override fun toString(): String {
            return name
        }
    }

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var entityTypes: List<PostgreSQLEntityType>

    companion object {
        private val ignoredFields = Regex("^(Companion|.*\\\$.*)$")
    }

    private lateinit var metaModel: Set<TypeInfo>

    /**
     * Get the meta information for the given type.
     * The method will return null, if the type does not exist.
     */
    fun getTypeInfo(type: KClass<out EntityBase>): TypeInfo? {
        val result = metaModel.filter { it.type == type }
        return if (result.isNotEmpty()) result[0] else null
    }

    /**
     * Get the meta information for field with the given name.
     * The method will search for a field with the given name. If resolveJson is true, it will also search
     * for a field with the given JSON name, if there is no such field.
     * The method will return null, if the field does not exist.
     */
    fun getFieldInfo(type: TypeInfo, field: String, resolveJson: Boolean = false): FieldInfo? {
        var result = type.fields.filter { it.name == field }
        if (result.isEmpty() && resolveJson) {
            result = type.fields.filter { it.jsonName == field }
        }
        return if (result.isNotEmpty()) result[0] else null
    }

    @PostConstruct
    private fun initialize() {
        val typeInfos = mutableSetOf<TypeInfo>()
        entityTypes.forEach { pType ->
            val type = pType.jpaType

            val hibernateModel = (entityManager.entityManagerFactory.metamodel as MetamodelImplementor).
                entityPersister(type.java.name) as AbstractEntityPersister

            val fieldInfos = mutableSetOf<FieldInfo>()
            type.java.declaredFields.forEach { field ->
                run {
                    if (!ignoredFields.matches(field.name)) {
                        val columnName = try {
                            hibernateModel.getPropertyColumnNames(field.name)[0]
                        } catch (e: Exception) {
                            null
                        }
                        // we are only interested in persistent fields
                        if (columnName != null) {
                            val aJP = field.annotations.find { it.annotationClass == JsonProperty::class } as? JsonProperty
                            val jsonName = aJP?.value ?: field.name

                            val relatedEntityType = when {
                                EntityBase::class.java.isAssignableFrom(field.type) -> field.type
                                field.genericType is ParameterizedType -> {
                                    (field.genericType as ParameterizedType).actualTypeArguments[0] as Class<*>
                                }
                                else -> null
                            }?.let { resolveJavaType(it) }

                            val aJC = field.annotations.find { it.annotationClass == JoinColumn::class } as? JoinColumn
                            val fkName = aJC?.name

                            fieldInfos.add(FieldInfo(
                                    name = field.name,
                                    type = field.type,
                                    columnName = columnName,
                                    jsonName = jsonName,
                                    relatedEntityType = relatedEntityType,
                                    fkName = fkName
                            ))
                        }
                    }
                }
            }
            run {
                typeInfos.add(TypeInfo(
                        name = type.java.name,
                        type = type,
                        tableName = hibernateModel.tableName,
                        fields = fieldInfos
                ))

            }
        }
        metaModel = ImmutableSet.copyOf(typeInfos)
    }

    private fun resolveJavaType(type: Class<*>): KClass<out EntityBase> {
        return entityTypes.first { it.jpaType.java == type }.jpaType
    }
}