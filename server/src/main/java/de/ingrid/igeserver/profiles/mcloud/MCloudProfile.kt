package de.ingrid.igeserver.profiles.mcloud

import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.profiles.mcloud.research.quickfilter.Spatial
import de.ingrid.igeserver.research.quickfilter.*
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service()
@Profile("mcloud")
class MCloudProfile : CatalogProfile {
    override val identifier: String = "mcloud"
    override val title: String = "mCLOUD Katalog"
    override val description: String? = null

    override fun getFacetDefinitions(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "type", "Typ", arrayOf(
                    Documents(),
                    Addresses()
                ),
                selection = Operator.OR
            ),
            FacetGroup(
                "state", "Zustand", arrayOf(
                    Latest(),
                    Published(),
                ),
                selection = Operator.OR
            ),
            FacetGroup(
                "docType", "Dokumententyp", arrayOf(
                    DocFolder(),
                    DocMCloud(),
                    DocTest()
                )
            ),
            FacetGroup(
                "spatial", "Raumbezug (mCLOUD)", arrayOf(
                    Spatial()
                ),
                selection = Operator.SPATIAL
            )
        )
    }
}