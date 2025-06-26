/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.features.ogc_api_distributions.profiles.bmi.distribution_helper

import de.ingrid.igeserver.features.ogc_api_distributions.distribution_helper.DistributionTypeInfo
import de.ingrid.igeserver.features.ogc_api_distributions.profiles.opendata.distribution_helper.OpenDataDistributionHelper
import de.ingrid.mdek.upload.storage.Storage
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Profile("bmi")
@Service
class BmiDistributionHelper(storage: Storage) : OpenDataDistributionHelper(storage) {

    override val typeInfo: DistributionTypeInfo
        get() = DistributionTypeInfo(
            "bmi",
            "BMI",
            description = "BMI distribution Helper",
            emptyList(),
        )

    override fun canHandleDistribution(profile: String): Boolean = "bmi" == profile
}
