import { RxStompService } from "./rx-stomp.service";
import { ConfigService } from "./services/config/config.service";
import { igeStompConfig } from "./ige-stomp.config";

export function rxStompServiceFactory(configService: ConfigService) {
  let brokerURL = configService.getConfiguration().brokerUrl;

  if (!brokerURL) {
    brokerURL =
      (window.location.protocol === "https:" ? "wss://" : "ws://") +
      window.location.host +
      "/ws";
  }

  igeStompConfig.brokerURL = brokerURL;

  const rxStomp = new RxStompService();
  rxStomp.configure(igeStompConfig);
  rxStomp.activate();
  return rxStomp;
}
