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
package de.ingrid.igeserver.features.ogc_api_distributions.distribution_helper

import de.ingrid.igeserver.configuration.ConfigurationException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class OgcDistributionHelperFactory() {

    @Autowired
    private lateinit var distributionHelper: List<OgcDistributionHelper>

    fun getDistributionHelper(profile: String): List<OgcDistributionHelper> {
        val responsibleDistributionHelper = distributionHelper
            .filter { it.canHandleDistribution(profile) }

        handleEmptyOrMultipleDistributionHelper(responsibleDistributionHelper, profile)

        return responsibleDistributionHelper
    }

    private fun handleEmptyOrMultipleDistributionHelper(
        responsibleImporter: List<OgcDistributionHelper>,
        profile: String,
    ) {
        if (responsibleImporter.isEmpty()) {
            throw ConfigurationException.withReason("No distribution helper found for profile type '$profile'.")
        } else if (responsibleImporter.size > 1) {
            val importerNames = responsibleImporter.joinToString(",") { it.typeInfo.name }
            throw ConfigurationException.withReason("More than one distribution helper found for profile type '$profile': '$importerNames'.")
        }
    }
}
