package de.ingrid.igeserver.profiles.uvp.api

data class UvpReport(
    val eiaStatistic: MutableList<Any?>,
    val procedureCount: Number,
    val negativePreliminaryAssessments: Number,
    val positivePreliminaryAssessments: Number,
    val averageProcedureDuration: Number
)
