import { KeycloakOptions, KeycloakService } from "keycloak-angular";
import { IgeError } from "./models/ige-error";
import { ConfigService } from "./services/config/config.service";

export function initializeKeycloakAndGetUserInfo(
  keycloak: KeycloakService,
  configService: ConfigService
) {
  return keycloak
    .init(getKeycloakOptions(configService))
    .then(() => keycloak.isLoggedIn())
    .then((loggedIn) =>
      loggedIn ? getUserInfo(configService) : keycloak.login()
    );
}

export function getUserInfo(configService) {
  return configService.getCurrentUserInfo().then((userInfo) => {
    // an admin role has no constraints
    if (!configService.isAdmin()) {
      // check if user has any assigned catalog
      if (userInfo.assignedCatalogs.length === 0) {
        const error = new IgeError();
        error.setMessage(
          "The user has no assigned catalog. An administrator has to assign a catalog to this user."
        );
        throw error;
      }
    }
  });
}

function getKeycloakOptions(configService: ConfigService): KeycloakOptions {
  const keycloakConfig = configService.getConfiguration().keycloak;
  return {
    config: {
      url: keycloakConfig.url,
      realm: keycloakConfig.realm,
      clientId: keycloakConfig.clientId,
    },
    // bearerExcludedUrls: ["/assets", "/clients/public"],
    loadUserProfileAtStartUp: false,
    initOptions: {
      onLoad: "check-sso",
      silentCheckSsoRedirectUri:
        window.location.origin + "/assets/silent-check-sso.html",
    },
  };
}
