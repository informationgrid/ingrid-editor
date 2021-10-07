package de.ingrid.igeserver.model

data class StatisticResponse(val totalNum: Number, val numPublished: Number, val numDrafts: Number, val statsPerType: Map<String,StatisticResponse>?)
