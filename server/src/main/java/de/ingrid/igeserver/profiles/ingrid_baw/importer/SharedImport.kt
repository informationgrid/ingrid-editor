package de.ingrid.igeserver.profiles.ingrid_baw.importer

fun hierarchyLevelNameToDocumentType(hierarchyLevelName: String?): String = when (hierarchyLevelName) {
    "Simulation",
    "Postprocessing",
    "Preprocessing",
    "Variante",
    "Szenario",
    "Simulationsmodell",
    "Simulationslauf",
    "Simulationsdatei",
    -> "BawSimulation"

    "measurement",
    "Messdaten",
    -> "BawMeasurement"

    else -> "InGridGeoDataset"
}
