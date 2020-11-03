package de.ingrid.igeserver.persistence.postgresql.jpa

import com.fasterxml.jackson.annotation.JsonAlias
import com.fasterxml.jackson.annotation.JsonProperty
import com.google.common.collect.ImmutableSet
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import org.hibernate.metamodel.spi.MetamodelImplementor
import org.hibernate.persister.entity.AbstractEntityPersister
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.lang.reflect.Field
import java.lang.reflect.Modifier
import java.lang.reflect.ParameterizedType
import javax.annotation.PostConstruct
import javax.persistence.EntityManager
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToMany
import kotlin.reflect.KClass
import kotlin.reflect.KVisibility
import kotlin.reflect.jvm.kotlinProperty

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
            val nmRelatedProperty: String?,
            val nmRelationTable: String?,
            val nmJoinColumn: String?,
            val nmInverseJoinColumn: String?
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
            getAllFields(type.java).forEach { field ->
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
                            val aJA = field.annotations.find { it.annotationClass == JsonAlias::class } as? JsonAlias
                            val jsonName = when {
                                aJP?.value != null -> aJP.value
                                aJA?.value != null && aJA.value.isNotEmpty() -> aJA.value[0]
                                else -> field.name
                            }

                            val relatedEntityType = when {
                                EntityBase::class.java.isAssignableFrom(field.type) -> field.type
                                field.genericType is ParameterizedType -> {
                                    (field.genericType as ParameterizedType).actualTypeArguments[0] as Class<*>
                                }
                                else -> null
                            }?.let { resolveJavaType(it) }

                            val aJC = field.annotations.find { it.annotationClass == JoinColumn::class } as? JoinColumn
                            val fkName = aJC?.name

                            val aMM = field.annotations.find { it.annotationClass == ManyToMany::class } as? ManyToMany
                            val nmRelatedProperty = if (aMM?.mappedBy.isNullOrEmpty()) null else aMM?.mappedBy

                            val aJT = field.annotations.find { it.annotationClass == JoinTable::class } as? JoinTable
                            val nmRelationTable = aJT?.name
                            val nmJoinColumn = if (aJT?.joinColumns?.size == 1) aJT.joinColumns[0].name else null
                            val nmInverseJoinColumn = if (aJT?.inverseJoinColumns?.size == 1) aJT.inverseJoinColumns[0].name else null

                            fieldInfos.add(FieldInfo(
                                    name = field.name,
                                    type = field.type,
                                    columnName = columnName,
                                    jsonName = jsonName,
                                    relatedEntityType = relatedEntityType,
                                    fkName = fkName,
                                    nmRelatedProperty = nmRelatedProperty,
                                    nmRelationTable = nmRelationTable,
                                    nmJoinColumn = nmJoinColumn,
                                    nmInverseJoinColumn = nmInverseJoinColumn
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

    private fun getAllFields(clazz: Class<*>?): List<Field> {
        if (clazz == null) {
            return listOf()
        }
        val result: MutableList<Field> = getAllFields(clazz.superclass).toMutableList()
        val filteredFields: List<Field> = clazz.declaredFields
                .filter {
                    f -> Modifier.isPublic(f.modifiers) || Modifier.isProtected(f.modifiers) ||
                        f.kotlinProperty?.visibility == KVisibility.PUBLIC || f.kotlinProperty?.visibility == KVisibility.PROTECTED
                }
        result.addAll(filteredFields)
        return result
    }
}