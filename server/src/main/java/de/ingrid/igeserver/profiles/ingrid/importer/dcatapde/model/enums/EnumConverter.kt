/*
 * **************************************************-
 * ogc-records-api
 * ==================================================
 * Copyright (C) 2022 - 2024 wemove digital solutions GmbH
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
 * **************************************************#
 */
package de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums

import jakarta.persistence.AttributeConverter

/**
 *
 * @param <T> basic class type which the enum encapsulates
</T> */
abstract class EnumConverter<T : Enum<T>>(private val clazz: Class<T>) : AttributeConverter<T?, String?> {
    override fun convertToDatabaseColumn(attribute: T?): String? {
        return attribute?.toString()
    }

    override fun convertToEntityAttribute(dbData: String?): T? {
        val enums = clazz.enumConstants
        for (e in enums) {
            if (e.toString() == dbData) {
                return e
            }
        }
        return null
    } /*@Override
    public String write(Object value) {
        return convertToDatabaseColumn((T) value);
    }

    @Override
    public T read(Object value) {
        return convertToEntityAttribute(value != null ? value.toString() : null);
    }*/
}
