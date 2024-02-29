package de.ingrid.igeserver.services

interface IConnection {
    fun isConnected(id: String): Boolean
    
    fun containsId(id: String): Boolean
}