/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_bkg.importer

import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.GeoserviceMapper
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.IsoImportData
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.UseConstraint

class GeoserviceMapperBkg(isoData: IsoImportData) : GeoserviceMapper(isoData) {
    val common = CommonMapperBkg(codeListService)

    override fun getAccessConstraints(): List<KeyValue> =
        common.accessConstraintsOverride(super.getAccessConstraints(), metadata)

    val accessConstraintBkg: AccessConstraint? = common.accessConstraintBkg(metadata)

    val useConstraintBkg: UseConstraint? = common.useConstraintBkg(getUseConstraints())
}
