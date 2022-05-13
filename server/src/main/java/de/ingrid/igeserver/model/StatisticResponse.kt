package de.ingrid.igeserver.model

// TODO: getStatistic and StatisticSearch should get different response
data class StatisticResponse(var totalNum: Int? = null, var numPublished: Int, var numDrafts: Int, val statsPerType: Map<String,StatisticResponse>? = null)
