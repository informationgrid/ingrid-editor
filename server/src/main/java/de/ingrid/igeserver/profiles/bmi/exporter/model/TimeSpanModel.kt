package de.ingrid.igeserver.profiles.bmi.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class TimeSpanModel(
    val rangeType: KeyValueModel?,
    val timeSpanDate: String?,
    val timeSpanRange: RangeModel?){

    val start: String?
        get(){
            when(rangeType?.key){
                "at" -> return timeSpanDate
                "since" -> return timeSpanDate
                "till" -> return null
                "range" -> return timeSpanRange?.start
            }
            return null
        }
    val end: String?
        get(){
            when(rangeType?.key){
                "at" -> return timeSpanDate
                "since" -> return null
                "till" -> return timeSpanDate
                "range" -> return timeSpanRange?.end
            }
            return null
        }
}
