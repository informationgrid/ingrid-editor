package de.ingrid.igeserver.model

data class StatisticResponse(var totalNum: Int, var numPublished: Int, var numDrafts: Int, val statsPerType: Map<String,StatisticResponse>?)
