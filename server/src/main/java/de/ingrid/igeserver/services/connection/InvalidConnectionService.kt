package de.ingrid.igeserver.services.connection

class InvalidConnectionService : IConnection {
    override fun isConnected(id: String): Boolean = false

    override fun containsId(id: String): Boolean = false
}
