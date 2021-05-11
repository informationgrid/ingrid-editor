import {InjectableRxStompConfig} from '@stomp/ng2-stompjs';
import {ConfigService} from './services/config/config.service';

export class IgeStompConfig extends InjectableRxStompConfig {
  constructor(private config: ConfigService) {
    super();

    // Which server?
    this.brokerURL = this.config.getConfiguration().brokerUrl;

    if (!this.brokerURL) {
      this.brokerURL = ((window.location.protocol === 'https:') ? 'wss://' : 'ws://') + window.location.host + '/ws';
    }

    // Headers
    // Typical keys: login, passcode, host
    /*connectHeaders: {
      login: 'guest',
      passcode: 'guest',
    },*/

    // How often to heartbeat?
    // Interval in milliseconds, set to 0 to disable
    this.heartbeatIncoming = 0; // Typical value 0 - disabled
    this.heartbeatOutgoing = 20000; // Typical value 20000 - every 20 seconds

    // Wait in milliseconds before attempting auto reconnect
    // Set to 0 to disable
    // Typical value 500 (500 milli seconds)
    this.reconnectDelay = 500;

    // Will log diagnostics on console
    // It can be quite verbose, not recommended in production
    // Skip this key to stop logging to console
    // if (!environment.production) {
    this.debug = (msg: string): void => {
      console.log(new Date(), msg);
    };
    // }
  }
}
