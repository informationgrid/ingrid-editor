package de.ingrid.igeserver.model

data class Job(val id: String, val name: String)

enum class JobCommand {start, stop, resume}