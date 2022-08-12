package de.ingrid.igeserver.model

// TODO: getStatistic and StatisticSearch should get different response
data class StatisticResponse(var totalNum: Long? = null, var numPublished: Long, var numDrafts: Long, val statsPerType: Map<String,StatisticResponse>? = null)
