package de.ingrid.igeserver.services

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.NotFoundException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import kotlin.math.abs

@Service
@Profile("ogc-api | csw-t")
class ApiValidationService @Autowired constructor(
    private val catalogService: CatalogService,
) {

    fun validateCollection(collectionId: String){
        if(!catalogService.catalogExists(collectionId)) throw NotFoundException.withMissingResource(collectionId, "Collection")
    }

    fun validateRequestParams(allRequestParams: Map<String, String>, validParams: List<String>){
        for(param in allRequestParams.keys){
            if(param !in validParams) throw ClientException.withReason("Request parameter '$param' not supported")
        }
    }

    fun validateParamFormat(format: String, supportedFormats: List<SupportFormat>){
        val supported: Boolean = supportedFormats.any { it.format == format}
        if(!supported) throw ClientException.withReason("Format '$format' not supported")
    }

    fun validateBbox(bbox: List<Float>?){
        if(bbox == null) return
        // http://localhost:8550/collections/ogctestkatalog/items?bbox=49.738177,8.176039,50.288841,9.340528

        // verify 4 values
        val size = bbox.size
        if( size != 4) throw ServerException.withReason("Bbox Error: Bbox must have 4 values; found $size values")

        val array = bbox.chunked(2) { it[0] to it[1] }

        // verify long and lat format
        for(coordinate in array) {
            // check if longitude is in range of -180 to 180
            if(abs(coordinate.first) > 180) throw ClientException.withReason("Bbox Error: Value '${coordinate.first}' does not represent a longitude.")
            // check if latitude is in range of -90 to 90
            if(abs(coordinate.second) > 90) throw ClientException.withReason("Bbox Error: Value '${coordinate.second}' does not represent a latitude.")
        }

        // verify valid bbox
        val long1 = array[0].first //bbox[0]
        val lat1 = array[0].second //bbox[1]
        val long2 = array[1].first //bbox[2]
        val lat2 = array[1].second //bbox[3]
        if(long1 > long2 && lat1 > lat2 ) throw ClientException.withReason("Bbox Error: Wrong order of bbox values.")
    }

}