/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
