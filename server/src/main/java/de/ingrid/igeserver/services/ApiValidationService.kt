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
class ApiValidationService(
    private val catalogService: CatalogService,
) {

    fun validateCollection(collectionId: String){
        if(!catalogService.catalogExists(collectionId)) throw NotFoundException.withMissingResource(collectionId, "Collection")
    }

    fun validateRequestParams(allRequestParams: Map<String, String>, validParams: List<String>){
        allRequestParams.keys.forEach { 
            if(it !in validParams) throw ClientException.withReason("Request parameter '$it' not supported") 
        }
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