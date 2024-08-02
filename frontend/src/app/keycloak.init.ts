/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { KeycloakOptions } from "keycloak-angular";
import { IgeError } from "./models/ige-error";
import { ConfigService, Configuration } from "./services/config/config.service";
import { AuthenticationFactory } from "./security/auth.factory";

export function initializeKeycloakAndGetUserInfo(
  authFactory: AuthenticationFactory,
  configService: ConfigService,
) {
  const config = configService.getConfiguration();
  config.keycloakEnabled
    ? authFactory.initWithKeycloak()
    : authFactory.initWithoutKeycloak();

  const auth = authFactory.get();
  return auth
    .init(getKeycloakOptions(configService))
    .then(() => auth.isLoggedIn())
    .then((loggedIn) => (loggedIn ? getUserInfo(configService) : auth.login()))
    .catch((ex) => handleKeycloakConfigError(ex, config));
}

export async function getUserInfo(configService: ConfigService) {
  let userInfo = await configService.getCurrentUserInfo();
  if (!configService.hasSuperAdminRights()) {
    // check if user has any assigned catalog
    if (userInfo.assignedCatalogs.length === 0) {
      throw new IgeError(
        "Ihnen wurde bisher kein Katalog zugewiesen. Lassen Sie sich durch einen Administrator einen Katalog zuweisen.",
      );
    }
  }
}

function getKeycloakOptions(configService: ConfigService): KeycloakOptions {
  const config = configService.getConfiguration();
  return {
    config: {
      url: config.keycloakUrl,
      realm: config.keycloakRealm,
      clientId: config.keycloakClientId,
    },
    // bearerExcludedUrls: ["/assets", "/clients/public"],
    loadUserProfileAtStartUp: false,
    initOptions: {
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: `${
        window.location.origin + config.contextPath
      }assets/silent-check-sso.html`,
    },
  };
}

function handleKeycloakConfigError(ex, config: Configuration) {
  if (ex === undefined) {
    throw `Keycloak scheint nicht korrekt konfiguriert zu sein: ${config.keycloakUrl} (${config.keycloakClientId})`;
  } else if (ex instanceof IgeError) {
    throw ex;
  }
  console.error(ex);
  throw new IgeError(ex);
}
