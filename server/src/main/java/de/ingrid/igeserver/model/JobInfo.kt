package de.ingrid.igeserver.model

import org.quartz.JobDataMap

data class JobInfo(val isRunning: Boolean, val info: Map<String, Any>?)