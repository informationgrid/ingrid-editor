/*
 * **************************************************-
 * ingrid-iplug
 * ==================================================
 * Copyright (C) 2014 - 2020 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.1 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * http://ec.europa.eu/idabc/eupl5
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 * **************************************************#
 */
package de.ingrid.igeserver.services.ibus

import de.ingrid.ibus.client.BusClientFactory
import de.ingrid.utils.*
import de.ingrid.utils.metadata.IMetadataInjector
import de.ingrid.utils.metadata.Metadata
import de.ingrid.utils.processor.IPostProcessor
import de.ingrid.utils.processor.IPreProcessor
import de.ingrid.utils.query.IngridQuery
import org.apache.commons.logging.LogFactory
import java.io.File
import java.io.IOException
import java.util.*


abstract class HeartBeatPlug : IPlug, IConfigurable {
    internal class HeartBeat(
        private val _name: String,
        val _busUrl: String,
        var _bus: IBus,
        private var _plugDescription: PlugDescription,
        period: Long,
        var metadataInjectors: Array<IMetadataInjector>?
    ) : TimerTask() {
        internal class ShutdownHook(private val _heartBeat: HeartBeat) : Thread() {
            override fun run() {
                _heartBeat.disable()
            }
        }

        var isEnable = false
            private set
        var isAccurate = false
            private set
        private var _heartBeatCount: Long = 0
        private val _metadataInjectors: Array<IMetadataInjector>?
        private val _shutdownHook: ShutdownHook
        private val _timer: Timer
        private var _heartBeatFailed: Boolean

        //        private final PlugDescriptionFieldFilters _filters;
        private var plugdescriptionAsFile: File? = null
        fun setIBus(ibus: IBus) {
            _bus = ibus
            // reset heartbeat failure since a new bus is connected
            _heartBeatFailed = false
        }

        @Throws(IOException::class)
        fun enable() {
            isEnable = true
            isAccurate = false
        }

        fun disable() {
            isEnable = false
            isAccurate = false
            try {
                if (_bus.containsPlugDescription(_plugDescription.plugId, _plugDescription.md5Hash)) {
                    _bus.removePlugDescription(_plugDescription)
                }
            } catch (e: Exception) {
                LOG.warn("error while disabling heartbeat '$_name'. maybe it's already disconnected?")
            }
            cancel()
        }

        override fun run() {
            if (isEnable) { // && !_heartBeatFailed) {
                _heartBeatCount++
                try {
                    // reset md5Hash for correct calculation
                    _plugDescription.md5Hash = ""

                    val md5 = _plugDescription.hashCode().toString()
                    val plugId = _plugDescription.plugId

                    LOG.debug("heartbeat#$_name send heartbeat [$_heartBeatCount] to bus [$_busUrl]")
                    val containsPlugDescription = _bus.containsPlugDescription(plugId, md5)
                    if (!containsPlugDescription) {
                        if (LOG.isInfoEnabled()) {
                            LOG.debug("adding or updating plug description to bus [$_busUrl] with md5 [$md5]")
                        }
                        _plugDescription.md5Hash = md5
//                        injectMetadatas(_plugDescription)
//                        _plugDescription = _filters.filter(_plugDescription);
                        _bus.addPlugDescription(_plugDescription)
                        if (LOG.isDebugEnabled) {
                            LOG.debug("added or updated plug description to bus [$_busUrl]: $_plugDescription")
                        }
                    } else {
                        if (LOG.isDebugEnabled) {
                            LOG.debug("I am currently connected to bus [$_busUrl].")
                        }
                    }
                    isAccurate = true
                } catch (e: Throwable) {
                    LOG.error("Can not send heartbeat [" + _heartBeatCount + "] to bus [" + _busUrl + "]. With plugdescription: " + _plugDescription + " Error message: " + e.message)
                    isAccurate = false
                    //this._heartBeatFailed = true;
                }
            } else {
                LOG.debug("Heartbeat not sent since it was disabled or a failure! ($this)")
            }
        }

        @Throws(Exception::class)
        private fun injectMetadatas(plugDescription: PlugDescription?) {
            var metadata = plugDescription!!.metadata
            metadata = metadata ?: Metadata()
            if (_metadataInjectors != null) {
                for (metadataInjector in _metadataInjectors) {
                    if (LOG.isDebugEnabled) {
                        LOG.debug("Inject metadatas using " + metadataInjector.javaClass.name)
                    }
                    metadataInjector.injectMetaDatas(metadata)
                }
            }
            if (LOG.isDebugEnabled) {
                LOG.debug("Injected metadata:$metadata")
            }
            plugDescription.metadata = metadata
        }

        fun setPlugDescription(plugDescription: PlugDescription) {
            _plugDescription = plugDescription
        }

        fun hasFailed(): Boolean {
            return _heartBeatFailed
        }

        companion object {
            private val LOG = LogFactory.getLog(HeartBeat::class.java)
        }

        init {
            _metadataInjectors = metadataInjectors
            _timer = Timer(true)
            _timer.schedule(this, Date(), period)
            _shutdownHook = ShutdownHook(this)
            _heartBeatFailed = false
            //            _filters = filters;
            Runtime.getRuntime().addShutdownHook(_shutdownHook)
        }
    }

    /**
     * This class observes the heart beats and restarts the communication
     * if any failure occurs, that cannot be corrected with a simple reconnect.
     *
     * @author Andre
     */
    internal class HeartBeatMonitor(period: Long, heartBeats: Map<String, HeartBeat>) : TimerTask() {
        private val _timer: Timer
        private val _heartBeats: Map<String, HeartBeat>
        override fun run() {
            val iterator = _heartBeats.values.iterator()
            while (iterator.hasNext()) {
                val heartBeat = iterator.next()
                if (heartBeat.hasFailed()) {
                    // restart complete communication (since it's not possible
                    // yet just to restart a single one)
                    try {
                        LOG.info("Restart iBusClient with all connections")
                        BusClientFactory.getBusClient().restart()
                        updateBusInHeartBeats()
                        break
                    } catch (e: Exception) {
                        // TODO Auto-generated catch block
                        e.printStackTrace()
                    }
                }
            }
        }

        private fun updateBusInHeartBeats() {
            val busClient = BusClientFactory.getBusClient()
            val busses = busClient.nonCacheableIBusses
            for (i in busses.indices) {
                val iBus = busses[i]
                val busUrl = busClient.getBusUrl(i)
                _heartBeats[busUrl]!!.setIBus(iBus)
                LOG.debug("update iBus in heartbeat")
            }
        }

        companion object {
            private val LOG = LogFactory.getLog(
                HeartBeatMonitor::class.java
            )
        }

        init {
            _timer = Timer(true)
            _timer.schedule(this, Date(), period)
            _heartBeats = heartBeats
            LOG.debug("HeartBeatMonitor started!")
        }
    }

    private val _heartBeats: MutableMap<String, HeartBeat> = LinkedHashMap()
    private val _period: Int
    private lateinit var _plugDescription: PlugDescription

    //    private final PlugDescriptionFieldFilters _filters;
    private val _injectors: Array<IMetadataInjector>?
    private val _postProcessors: Array<IPostProcessor>?
    private val _preProcessors: Array<IPreProcessor>?

    constructor(
        period: Int,
        injectors: Array<IMetadataInjector>?,
        preProcessors: Array<IPreProcessor>?,
        postProcessors: Array<IPostProcessor>?
    ) {
        _period = period
        //        _filters = plugDescriptionFieldFilters;
        _injectors = injectors
        _preProcessors = preProcessors
        _postProcessors = postProcessors
    }

    @Deprecated("")
    constructor(period: Int) {
        _period = period
        //        _filters = new PlugDescriptionFieldFilters();
        _injectors = null
        _preProcessors = null
        _postProcessors = null
    }

    override fun configure(plugDescription: PlugDescription) {
        // configurate injectors
        /*for (final IMetadataInjector injector : _injectors) {
            injector.configure(plugDescription);
        }*/

        val clone = plugDescription.clone() as PlugDescription
        clone.remove("busUrls")
//        clone.remove("METADATAS")

        // stop and remove existing heartbeats
//        _plugDescription = _filters.filter(plugDescription);
        _plugDescription = clone
//        _plugDescription.metadata = Metadata()
        val busClient = BusClientFactory.getBusClient()
        if (busClient != null) {
            _plugDescription.proxyServiceURL = busClient.peerName
            // remove old hearbeats
            stopHeartBeats()
            _heartBeats.clear()
            // configure heartbeat's
            val busses = busClient.nonCacheableIBusses
            for (i in busses.indices) {
                val iBus = busses[i]
                val busUrl = busClient.getBusUrl(i)
                if (!_heartBeats.containsKey(busUrl)) {
                    val heartBeat = HeartBeat(
                        "no." + _heartBeats.size,
                        busUrl,
                        iBus,
                        _plugDescription,
                        _period.toLong(),
                        _injectors
                    )
                    _heartBeats[busUrl] = heartBeat
                }
                val heartBeat = _heartBeats[busUrl]
                heartBeat!!.setPlugDescription(_plugDescription)
                // force adding of plugdescription the first time
                iBus.addPlugDescription(_plugDescription)
            }
            //_heartBeatMonitor = new HeartBeatMonitor(20000, _heartBeats);
        }

        // start sending HeartBeats to connected iBuses
        try {
            startHeartBeats()
        } catch (e: IOException) {
            LOG.error("Couldn't start HeartBeats!", e)
        }
    }

    fun reconfigure() {
        // remove old hearbeats
        stopHeartBeats()
        _heartBeats.clear()
        configure(_plugDescription)
    }

    @Throws(Exception::class)
    override fun close() {
        stopHeartBeats()
        for (heartBeat in _heartBeats.values) {
            val bus = heartBeat._bus
            bus.removePlugDescription(_plugDescription)
        }
        BusClientFactory.getBusClient().shutdown()
    }

    @Throws(IOException::class)
    fun startHeartBeats() {
        // Heartbeats not supported because iPlug contains a plug description for each catalog
        return
        /*LOG.info("start heart beats")
        val iterator: Iterator<HeartBeat> = _heartBeats.values.iterator()
        var index = 0
        while (iterator.hasNext()) {
            val heartBeat = iterator.next()
            heartBeat.enable()
            if (BusClientFactory.getBusClient().isConnected(index)) {
                heartBeat.run()
            }
            index++
        }*/
    }

    fun stopHeartBeats() {
        LOG.info("stop heart beats")
        val iterator: Iterator<HeartBeat> = _heartBeats.values.iterator()
        var index = 0
        while (iterator.hasNext()) {
            // only disable heartbeat for those who are connected
            val heartBeat = iterator.next()
            try {
                if (BusClientFactory.getBusClient().isConnected(index)) {
                    if (heartBeat.isEnable) {
                        heartBeat.disable()
                    }
                } else {
                    LOG.warn("HeartBeat already stopped, because there's no connection to ibus: " + heartBeat._busUrl)
                }
                index++
            } catch (e: IndexOutOfBoundsException) {
                LOG.warn("Could not check for connection at iBus: $index")
                heartBeat.disable()
                break
            }
        }
    }

    fun sendingHeartBeats(): Boolean {
        var bit = false
        for (heartBeat in _heartBeats.values) {
            if (heartBeat.isEnable) {
                bit = true
                break
            }
        }
        return bit
    }

    fun sendingAccurate(): Boolean {
        var bit = sendingHeartBeats()
        if (bit) {
            for (heartBeat in _heartBeats.values) {
                if (!heartBeat.isAccurate) {
                    bit = false
                    break
                }
            }
        }
        return bit
    }

    @Throws(Exception::class)
    protected fun preProcess(ingridQuery: IngridQuery?) {
        if (_preProcessors != null) {
            for (processor in _preProcessors) {
                processor.process(ingridQuery)
            }
        }
    }

    @Throws(Exception::class)
    protected fun postProcess(ingridQuery: IngridQuery?, documents: Array<IngridDocument?>?) {
        if (_postProcessors != null) {
            for (processor in _postProcessors) {
                processor.process(ingridQuery, documents)
            }
        }
    }

    companion object {
        private val LOG = LogFactory.getLog(HeartBeatPlug::class.java)
    }
}
