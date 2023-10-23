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

export function getUserInfo(configService: ConfigService) {
  return configService.getCurrentUserInfo().then((userInfo) => {
    // an admin role has no constraints
    if (!configService.isAdmin()) {
      // check if user has any assigned catalog
      if (userInfo.assignedCatalogs.length === 0) {
        throw new IgeError(
          "Ihnen wurde bisher kein Katalog zugewiesen. Lassen Sie sich durch einen Administrator einen Katalog zuweisen.",
        );
      }
    }
  });
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
