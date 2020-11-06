package de.ingrid.igeserver.persistence.postgresql.jpa

class JoinInfo(
        val thisType: ModelRegistry.TypeInfo,
        val otherType: ModelRegistry.TypeInfo,
        val relationField: ModelRegistry.FieldInfo,
        val thisAliasIndex: Int = 1,
        val otherAliasIndex: Int = 1
) {
    val relationColumn: String?
        get() = relationField.fkName

    val joinedTableAlias: String
        get() = otherType.aliasName(otherAliasIndex)

    val joinString: String
        get() {
            return if (relationField.nmRelationTable != null) {
                // many-to-many relation end
                val relationTableAliasName = relationField.nmRelationTable.toLowerCase()+otherAliasIndex.toString()
                "LEFT JOIN ${relationField.nmRelationTable} $relationTableAliasName ON " +
                        "$relationTableAliasName.${relationField.nmInverseJoinColumn} = " +
                        "${thisType.aliasName(otherAliasIndex)}.${thisType.pkName} " +
                "LEFT JOIN ${otherType.tableName} ${otherType.aliasName(otherAliasIndex)} ON " +
                        "$relationTableAliasName.${relationField.nmJoinColumn} = " +
                        "${otherType.aliasName(otherAliasIndex)}.${otherType.pkName}"
            }
            else {
                // many-to-one relation end
                "LEFT JOIN ${otherType.tableName} ${otherType.aliasName(otherAliasIndex)} ON " +
                        "${thisType.aliasName(thisAliasIndex)}.${relationField.fkName} = " +
                        "${otherType.aliasName(otherAliasIndex)}.${otherType.pkName}"
            }
        }

    override fun toString(): String {
        val arrow = "-(${if (relationField.nmRelationTable != null) "n:m" else "n:1"})->"
        return "${thisType.aliasName(thisAliasIndex)}.${relationField} $arrow ${otherType.aliasName(otherAliasIndex)}"
    }
}