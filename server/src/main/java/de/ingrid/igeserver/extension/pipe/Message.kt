package de.ingrid.igeserver.extension.pipe

import de.ingrid.igeserver.exports.iso.Date

/**
 * A message passed within the context when running the filters in a pipe
 */
data class Message(val creator: Any, val message: String, val created: Date = Date()) {
}