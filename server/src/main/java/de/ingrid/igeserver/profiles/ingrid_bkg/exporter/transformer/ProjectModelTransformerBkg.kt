/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_bkg.exporter.transformer

import de.ingrid.igeserver.profiles.ingrid.exporter.AccessConstraint
import de.ingrid.igeserver.profiles.ingrid.exporter.ProjectModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid_bkg.exporter.BkgCommonTransformer

class ProjectModelTransformerBkg(transformerConfig: TransformerConfig) : ProjectModelTransformer(transformerConfig) {

    private var bkgTransformer = BkgCommonTransformer(transformerConfig.codelists, doc)

    override val useAndAccessConstraintsCodelistValues: List<String> =
        bkgTransformer.useConstraintsCodelistValue ?: super.useAndAccessConstraintsCodelistValues

    override val useConstraints: List<UseConstraintTemplate> = super.useConstraints + bkgTransformer.getUseConstraints()

    override fun getAccessConstraints(): List<AccessConstraint> =
        super.getAccessConstraints() + bkgTransformer.getAccessConstraints(super.useAndAccessConstraintsCodelistValues)
}
