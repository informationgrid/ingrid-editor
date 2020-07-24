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
package de.ingrid.igeserver.services.ibus;

import de.ingrid.ibus.client.BusClient;
import de.ingrid.ibus.client.BusClientFactory;
import de.ingrid.utils.*;
import de.ingrid.utils.metadata.IMetadataInjector;
import de.ingrid.utils.metadata.Metadata;
import de.ingrid.utils.processor.IPostProcessor;
import de.ingrid.utils.processor.IPreProcessor;
import de.ingrid.utils.query.IngridQuery;
import de.ingrid.utils.tool.MD5Util;
import de.ingrid.utils.xml.PlugdescriptionSerializer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.File;
import java.io.IOException;
import java.util.*;


public abstract class HeartBeatPlug implements IPlug, IConfigurable {

    static class HeartBeat extends TimerTask {

        static class ShutdownHook extends Thread {
            private final HeartBeat _heartBeat;

            public ShutdownHook(final HeartBeat heartBeat) {

                _heartBeat = heartBeat;
            }

            @Override
            public void run() {

                _heartBeat.disable();
            }

        }

        private boolean _enable = false;

        private boolean _accurate = false;

        private static final Log LOG = LogFactory.getLog(HeartBeat.class);

        private PlugDescription _plugDescription;

        private IBus _bus;

        private long _heartBeatCount;

        private final IMetadataInjector[] _metadataInjectors;

        private final String _busUrl;

        private final String _name;

        private final ShutdownHook _shutdownHook;

        private final Timer _timer;

        private boolean _heartBeatFailed;

//        private final PlugDescriptionFieldFilters _filters;

        private File plugdescriptionAsFile = null;

        public HeartBeat(final String name, final String busUrl, final IBus bus, final PlugDescription plugDescription, final long period, final IMetadataInjector... metadataInjectors) {

            _name = name;
            _busUrl = busUrl;
            _bus = bus;
            _plugDescription = plugDescription;
            _metadataInjectors = metadataInjectors;
            _timer = new Timer(true);
            _timer.schedule(this, new Date(), period);
            _shutdownHook = new ShutdownHook(this);
            _heartBeatFailed = false;
//            _filters = filters;
            Runtime.getRuntime().addShutdownHook(_shutdownHook);
        }

        public void setIBus(IBus ibus) {

            _bus = ibus;
            // reset heartbeat failure since a new bus is connected
            _heartBeatFailed = false;
        }

        public void enable() throws IOException {

            _enable = true;
            _accurate = false;
        }

        public void disable() {

            _enable = false;
            _accurate = false;
            try {
                if (_bus.containsPlugDescription(_plugDescription.getPlugId(), _plugDescription.getMd5Hash())) {
                    _bus.removePlugDescription(_plugDescription);
                }
            } catch (final Exception e) {
                LOG.warn("error while disabling heartbeat '" + _name + "'. maybe it's already disconnected?");
            }
            this.cancel();
        }

        public boolean isEnable() {

            return _enable;
        }

        public boolean isAccurate() {

            return _accurate;
        }

        @Override
        public void run() {

            if (_enable) { // && !_heartBeatFailed) {
                _heartBeatCount++;
                try {

                    final int oldMetadataHashCode = _plugDescription.getMetadata().hashCode();
                    injectMetadatas(_plugDescription);
                    final int newMetadataHashCode = _plugDescription.getMetadata().hashCode();
                    final boolean changedMetadata = oldMetadataHashCode != newMetadataHashCode;

                    plugdescriptionAsFile = _plugDescription.getDesrializedFromFolder();
//                    final String md5 = MD5Util.getMD5(plugdescriptionAsFile);
                    final String plugId = _plugDescription.getPlugId();

                    /*if (changedMetadata) {
                        LOG.info("Detect changed metadata: " + changedMetadata);
                        LOG.info("Metadata: " + _plugDescription.getMetadata());
                        if (_bus.containsPlugDescription(plugId, md5)) {
                            LOG.info("remove plugdescription.");
                            _bus.removePlugDescription(_plugDescription);
                        }
                    }*/

                    LOG.info("heartbeat#" + _name + " send heartbeat [" + (_heartBeatCount) + "] to bus [" + _busUrl + "]");
                    final boolean containsPlugDescription = false; // _bus.containsPlugDescription(plugId, md5);

                    if (!containsPlugDescription) {
                        /*if (LOG.isInfoEnabled()) {
                            LOG.info("adding or updating plug description to bus [" + _busUrl + "] with md5 [" + md5 + "]");
                        }*/
                        // read plugdescription from file system in case it was changed externally and 
                        // could not be updated in all IConfigurable instances
//                        _plugDescription = new PlugdescriptionSerializer().deSerialize(plugdescriptionAsFile);
//                        _plugDescription.setMd5Hash(md5);
                        injectMetadatas(_plugDescription);
//                        _plugDescription = _filters.filter(_plugDescription);
                        _bus.addPlugDescription(_plugDescription);
                        if (LOG.isDebugEnabled()) {
                            LOG.debug("added or updated plug description to bus [" + _busUrl + "]: " + _plugDescription);
                        }
                    } else {
                        if (LOG.isDebugEnabled()) {
                            LOG.debug("I am currently connected to bus [" + _busUrl + "].");
                        }
                    }
                    _accurate = true;
                } catch (final Throwable e) {
                    LOG.error("Can not send heartbeat [" + _heartBeatCount + "] to bus [" + _busUrl + "]. With plugdescription: " + _plugDescription, e);
                    _accurate = false;
                    //this._heartBeatFailed = true;

                    // try to reload plugdescription in case it was reseted
                    // suspicious Exception:
                    /*
                     * ERROR: 2012-11-26 18:39:48.458: de.ingrid.iplug.HeartBeatPlug$HeartBeat.run(169): Can not send heartbeat [3].
                         java.lang.NullPointerException
                                at de.ingrid.iplug.HeartBeatPlug$HeartBeat.run(HeartBeatPlug.java:127)
                                at java.util.TimerThread.mainLoop(Timer.java:512)
                                at java.util.TimerThread.run(Timer.java:462)
                     * 
                     */
                    if (_plugDescription == null || _plugDescription.getMetadata() == null) {
                        LOG.info("PlugDescription or metadata is null. Reload PlugDescription from file...");
                        try {
                            _plugDescription = new PlugdescriptionSerializer().deSerialize(plugdescriptionAsFile);
                            injectMetadatas(_plugDescription);
                        } catch (IOException e1) {
                            LOG.error("Cannot deserialize plugdescription from: " + plugdescriptionAsFile, e1);
                        } catch (Exception e1) {
                            LOG.error("Cannot inject Metadate into plugdescription.", e1);
                        }
                    }
                }
            } else {
                LOG.debug("Heartbeat not sent since it was disabled or a failure! (" + this + ")");
            }

        }

        private void injectMetadatas(final PlugDescription plugDescription) throws Exception {

            Metadata metadata = plugDescription.getMetadata();
            metadata = metadata != null ? metadata : new Metadata();
            if (_metadataInjectors != null) {
                for (final IMetadataInjector metadataInjector : _metadataInjectors) {
                    if (LOG.isDebugEnabled()) {
                        LOG.debug("Inject metadatas using " + metadataInjector.getClass().getName());
                    }
                    metadataInjector.injectMetaDatas(metadata);
                }
            }
            if (LOG.isDebugEnabled()) {
                LOG.debug("Injected metadata:" + metadata);
            }
            plugDescription.setMetadata(metadata);
        }

        public void setPlugDescription(final PlugDescription plugDescription) {

            _plugDescription = plugDescription;
        }

        public boolean hasFailed() {

            return _heartBeatFailed;
        }

    }

    /**
     * This class observes the heart beats and restarts the communication
     * if any failure occurs, that cannot be corrected with a simple reconnect.
     *
     * @author Andre
     */
    static class HeartBeatMonitor extends TimerTask {
        private static final Log LOG = LogFactory.getLog(HeartBeatMonitor.class);

        private Timer _timer;

        private final Map<String, HeartBeat> _heartBeats;

        public HeartBeatMonitor(final long period, final Map<String, HeartBeat> heartBeats) {

            this._timer = new Timer(true);
            this._timer.schedule(this, new Date(), period);
            this._heartBeats = heartBeats;
            LOG.debug("HeartBeatMonitor started!");
        }

        @Override
        public void run() {

            final Iterator<HeartBeat> iterator = _heartBeats.values().iterator();
            while (iterator.hasNext()) {
                final HeartBeatPlug.HeartBeat heartBeat = iterator.next();
                if (heartBeat.hasFailed()) {
                    // restart complete communication (since it's not possible 
                    // yet just to restart a single one)
                    try {
                        LOG.info("Restart iBusClient with all connections");
                        BusClientFactory.getBusClient().restart();
                        updateBusInHeartBeats();
                        break;
                    } catch (Exception e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                    }
                }
            }
        }

        private void updateBusInHeartBeats() {

            BusClient busClient = BusClientFactory.getBusClient();
            List<IBus> busses = busClient.getNonCacheableIBusses();
            for (int i = 0; i < busses.size(); i++) {
                final IBus iBus = busses.get(i);
                final String busUrl = busClient.getBusUrl(i);
                _heartBeats.get(busUrl).setIBus(iBus);
                LOG.debug("update iBus in heartbeat");
            }
        }

    }

    private static final Log LOG = LogFactory.getLog(HeartBeatPlug.class);

    private final Map<String, HeartBeat> _heartBeats = new LinkedHashMap<String, HeartBeat>();

    private final int _period;

    private PlugDescription _plugDescription;

//    private final PlugDescriptionFieldFilters _filters;

    private final IMetadataInjector[] _injectors;

    private final IPostProcessor[] _postProcessors;

    private final IPreProcessor[] _preProcessors;

    public HeartBeatPlug(final int period, final IMetadataInjector[] injectors, final IPreProcessor[] preProcessors, final IPostProcessor[] postProcessors) {

        _period = period;
//        _filters = plugDescriptionFieldFilters;
        _injectors = injectors;
        _preProcessors = preProcessors;
        _postProcessors = postProcessors;
    }

    @Deprecated
    public HeartBeatPlug(final int period) {

        _period = period;
//        _filters = new PlugDescriptionFieldFilters();
        _injectors = null;
        _preProcessors = null;
        _postProcessors = null;
    }

    @Override
    public void configure(final PlugDescription plugDescription) {
        // configurate injectors
        /*for (final IMetadataInjector injector : _injectors) {
            injector.configure(plugDescription);
        }*/

        // stop and remove existing heartbeats
//        _plugDescription = _filters.filter(plugDescription);
        _plugDescription = plugDescription;
        _plugDescription.setMetadata(new Metadata());
        final BusClient busClient = BusClientFactory.getBusClient();
        if (busClient != null) {
            _plugDescription.setProxyServiceURL(busClient.getPeerName());
            // remove old hearbeats
            stopHeartBeats();
            _heartBeats.clear();
            // configure heartbeat's
            final List<IBus> busses = busClient.getNonCacheableIBusses();
            for (int i = 0; i < busses.size(); i++) {
                final IBus iBus = busses.get(i);
                final String busUrl = busClient.getBusUrl(i);
                if (!_heartBeats.containsKey(busUrl)) {
                    final HeartBeat heartBeat = new HeartBeat("no." + _heartBeats.size(), busUrl, iBus, _plugDescription, _period, _injectors);
                    _heartBeats.put(busUrl, heartBeat);
                }
                final HeartBeat heartBeat = _heartBeats.get(busUrl);
                heartBeat.setPlugDescription(_plugDescription);
            }
            //_heartBeatMonitor = new HeartBeatMonitor(20000, _heartBeats);
        }

        // start sending HeartBeats to connected iBuses
        try {
            startHeartBeats();
        } catch (final IOException e) {
            LOG.error("Couldn't start HeartBeats!", e);
        }
    }

    public void reconfigure() {
        // remove old hearbeats
        stopHeartBeats();
        _heartBeats.clear();
        if (_plugDescription != null) {
            configure(_plugDescription);
        }
    }

    @Override
    public void close() throws Exception {

        stopHeartBeats();
        for (final HeartBeat heartBeat : _heartBeats.values()) {
            final IBus bus = heartBeat._bus;
            bus.removePlugDescription(_plugDescription);
        }
        BusClientFactory.getBusClient().shutdown();
    }

    public void startHeartBeats() throws IOException {

        LOG.info("start heart beats");
        final Iterator<HeartBeat> iterator = _heartBeats.values().iterator();
        int index = 0;
        while (iterator.hasNext()) {
            final HeartBeatPlug.HeartBeat heartBeat = iterator.next();
            heartBeat.enable();
            if (BusClientFactory.getBusClient().isConnected(index)) {
                heartBeat.run();
            }
            index++;
        }
    }

    public void stopHeartBeats() {

        LOG.info("stop heart beats");
        final Iterator<HeartBeat> iterator = _heartBeats.values().iterator();
        int index = 0;
        while (iterator.hasNext()) {
            // only disable heartbeat for those who are connected
            final HeartBeatPlug.HeartBeat heartBeat = iterator.next();
            try {
                if (BusClientFactory.getBusClient().isConnected(index)) {
                    if (heartBeat._enable) {
                        heartBeat.disable();
                    }
                } else {
                    LOG.warn("HeartBeat already stopped, because there's no connection to ibus: " + heartBeat._busUrl);
                }
                index++;
            } catch (IndexOutOfBoundsException e) {
                LOG.warn("Could not check for connection at iBus: " + index);
                heartBeat.disable();
                break;
            }
        }
    }

    public boolean sendingHeartBeats() {

        boolean bit = false;
        for (final HeartBeat heartBeat : _heartBeats.values()) {
            if (heartBeat.isEnable()) {
                bit = true;
                break;
            }
        }
        return bit;
    }

    public boolean sendingAccurate() {

        boolean bit = sendingHeartBeats();
        if (bit) {
            for (final HeartBeat heartBeat : _heartBeats.values()) {
                if (!heartBeat.isAccurate()) {
                    bit = false;
                    break;
                }
            }
        }
        return bit;
    }

    protected void preProcess(final IngridQuery ingridQuery) throws Exception {

        if (_preProcessors != null) {
            for (final IPreProcessor processor : _preProcessors) {
                processor.process(ingridQuery);
            }
        }
    }

    protected void postProcess(final IngridQuery ingridQuery, final IngridDocument[] documents) throws Exception {

        if (_postProcessors != null) {
            for (final IPostProcessor processor : _postProcessors) {
                processor.process(ingridQuery, documents);
            }
        }
    }

}