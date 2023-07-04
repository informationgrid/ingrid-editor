package de.ingrid.igeserver.services.getCapabilities

import org.w3c.dom.Document

/**
 * This interface describes the information of a capability document.
 * @author André Wallat
 */
interface ICapabilitiesParser {
    fun getCapabilitiesData(doc: Document): CapabilitiesBean
}