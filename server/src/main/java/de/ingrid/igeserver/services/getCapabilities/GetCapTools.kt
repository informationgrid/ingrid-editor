package de.ingrid.igeserver.services.getCapabilities
 
fun getUnionOfBoundingBoxes(boundingBoxesFromLayers: List<LocationBean>): LocationBean {
    val unionLocation = LocationBean()
    unionLocation.type = "frei"
    for (location in boundingBoxesFromLayers) {
        if (unionLocation.latitude1 == null) {
            if (location.latitude1 == null) continue
            unionLocation.latitude1 = location.latitude1
        }
        if (unionLocation.latitude1!! > location.latitude1!!) unionLocation.latitude1 = location.latitude1
        if (unionLocation.longitude1 == null) unionLocation.longitude1 = location.longitude1
        if (unionLocation.longitude1!! > location.longitude1!!) unionLocation.longitude1 = location.longitude1
        if (unionLocation.latitude2 == null) unionLocation.latitude2 = location.latitude2
        if (unionLocation.latitude2!! < location.latitude2!!) unionLocation.latitude2 = location.latitude2
        if (unionLocation.longitude2 == null) unionLocation.longitude2 = location.longitude2
        if (unionLocation.longitude2!! < location.longitude2!!) unionLocation.longitude2 = location.longitude2
    }
    return unionLocation
}