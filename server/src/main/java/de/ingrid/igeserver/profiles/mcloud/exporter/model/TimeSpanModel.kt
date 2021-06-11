package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class TimeSpanModel(
    val rangeType: String?,
    val timeSpanDate: String?,
    val timeSpanRange: RangeModel?){

    val start: String?
        get(){
            when(rangeType){
                "at" -> return timeSpanDate
                "since" -> return timeSpanDate
                "till" -> return null
                "range" -> return timeSpanRange?.start
            }
            return null
        }
    val end: String?
        get(){
            when(rangeType){
                "at" -> return timeSpanDate
                "since" -> return null
                "till" -> return timeSpanDate
                "range" -> return timeSpanRange?.end
            }
            return null
        }
}
