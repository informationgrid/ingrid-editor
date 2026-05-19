/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { registerLocaleData } from "@angular/common";
import { ConfigService, Configuration } from "./services/config/config.service";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { IgeError } from "./models/ige-error";
import de from "@angular/common/locales/de";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "./dialogs/confirm/confirm-dialog.component";
import { Router } from "@angular/router";
import { Catalog } from "./+catalog/services/catalog.model";
import { firstValueFrom } from "rxjs";
import { TranslocoService } from "@jsverse/transloco";
import { ProfileService } from "./services/profile.service";
import { catchError, filter, map, switchMap, take } from "rxjs/operators";
import { ProfileMapper } from "../profiles/profile.mapper";
import { Type } from "@angular/core";
import { MatomoInitializerService, MatomoTracker } from "ngx-matomo-client";

registerLocaleData(de);

function loadProfile(configService: ConfigService) {
  return new Promise<void>((resolve, reject) => {
    const hasCatalogAssigned = ProfileService.userHasAnyCatalog(
      configService.$userInfo.value,
    );
    if (!hasCatalogAssigned) {
      resolve();
      return;
    }

    configService.$userInfo
      .pipe(
        filter((info) => ProfileService.userHasAnyCatalog(info)),
        switchMap((info) => ProfileMapper(info.currentCatalog.type)),
        map(({ ProfilePack }) => ProfilePack.getMyComponent() as Type<any>),
        take(1),
        catchError(() => {
          const igeError = new IgeError(
            `Profile '${configService.$userInfo.value.currentCatalog?.type}' could not be loaded. You may need to add it to the profile.mapper.ts file.`,
          );
          reject(igeError);
          throw igeError;
        }),
      )
      .subscribe((data) => {
        configService.profileModule = data;
        resolve();
      });
  });
}

export function ConfigLoader(
  configService: ConfigService,
  router: Router,
  http: HttpClient,
  dialog: MatDialog,
  translocoService: TranslocoService,
  generalStore: any,
  matomoInitializer: MatomoInitializerService,
  matomoTracker: MatomoTracker,
) {
  function getRedirectNavigationCommand(catalogId: string, urlPath: string) {
    const splittedUrl = urlPath.split(";");
    const commands: any[] = [`/${catalogId}/${splittedUrl[0]}`];
    if (splittedUrl.length > 1) {
      const parameterData = splittedUrl[1].split("=");
      const parameter = {};
      parameter[parameterData[0]] = parameterData[1];
      commands.push(parameter);
    }
    return commands;
  }

  async function prepareCatalogRedirect(
    router: Router,
    dialog: MatDialog,
  ): Promise<any[] | null> {
    const userInfo = configService.$userInfo.value;
    const catalogId = userInfo.currentCatalog.id;
    const contextPath = configService.getConfiguration().contextPath;
    const urlPath = document.location.pathname.substring(contextPath.length); // remove context path
    // get first part of the path without any parameters separated by ";"
    const rootPath = urlPath
      .split("/")[0] // split paths
      .split(";")[0]; // split parameters
    if (rootPath !== catalogId) {
      // check if no catalogId is in requested URL
      const hasNoCatalogId =
        rootPath === "index.html" ||
        router.config[0].children.some((route) => route.path === rootPath);
      if (hasNoCatalogId) {
        return getRedirectNavigationCommand(catalogId, urlPath);
      }

      const isAssignedToCatalog = userInfo.assignedCatalogs.some(
        (assigned) => assigned.id === rootPath,
      );
      if (isAssignedToCatalog) {
        await firstValueFrom(
          http.post<Catalog>(
            configService.getConfiguration().backendUrl +
              "user/catalog/" +
              rootPath,
            null,
          ),
        )
          .then(() => configService.getCurrentUserInfo())
          .then((info) => {
            const language = info.currentCatalog.settings?.config.language;
            if (language) generalStore.setCatalogLanguage(language);
          });
        return null;
      }

      if (catalogId === undefined) {
        return [`${ConfigService.catalogId}/dashboard`];
      }

      dialog
        .open(ConfirmDialogComponent, {
          data: {
            title: "Hinweis",
            message: `Der Katalog "${rootPath}" ist dem eingeloggten Benutzer nicht zugeordnet`,
            buttons: [{ text: "Schließen", alignRight: true, emphasize: true }],
          } as ConfirmDialogData,
        })
        .afterClosed()
        .subscribe(() => {
          router.navigate([`${ConfigService.catalogId}/dashboard`]);
        });
    }
    return null;
  }

  function initializeMatomo(config: Configuration) {
    if (config.matomoDisableCookies) matomoTracker.disableCookies();
    matomoInitializer.initializeTracker({
      siteId: config.matomoSiteId,
      trackerUrl: config.matomoUrl,
    });
  }

  function handleUnsupportedProfile() {
    setTimeout(() => {
      const path = window.location.pathname.split(";")[0];
      const otherCatalogId =
        configService.$userInfo.value.assignedCatalogs.find(
          (item) => item.id !== ConfigService.catalogId,
        ).id;
      window.location.href = path.replace(
        ConfigService.catalogId,
        otherCatalogId,
      );
    }, 1000);
  }

  return async () => {
    try {
      await configService.load();

      const config = configService.getConfiguration();
      if (config.matomoUrl) initializeMatomo(config);
      // Fetch current user via BFF session. If unauthenticated, the interceptor will route to session-expired.
      try {
        await configService.getCurrentUserInfo();
      } catch (err: any) {
        // If we are unauthenticated, route to the session-expired page and finish init silently
        if (err && (err.status === 401 || err?.name === "HttpErrorResponse")) {
          await router.navigate(["/session-expired"], {
            queryParams: {
              from:
                typeof window !== "undefined"
                  ? window.location.pathname
                  : undefined,
            },
          });
          return; // stop further init until user logs in
        }
        throw err; // rethrow other errors
      }
      const language =
        configService.$userInfo.value.currentCatalog.settings?.config.language;
      if (language) generalStore.setCatalogLanguage(language);
      await firstValueFrom(translocoService.load("de"));
      const redirectCommands = await prepareCatalogRedirect(router, dialog);
      await loadProfile.call(ConfigLoader, configService);
      if (redirectCommands) {
        // redirect a bit delayed to complete this navigation first before doing another
        // also make sure dynamically added routes have been already added
        setTimeout(() => router.navigate(redirectCommands), 0);
      }
      console.debug("FINISHED APP INIT");
    } catch (err: any) {
      if (err.message === "Profile could not be loaded") {
        handleUnsupportedProfile();
        return;
      }
      // remove loading spinner and rethrow error
      document.getElementsByClassName("app-loading").item(0).innerHTML =
        "Fehler bei der Initialisierung";

      if (err.status === 504) {
        throw new IgeError("Backend ist wohl nicht gestartet");
      } else if (err instanceof IgeError) {
        throw err;
      }
      throw new IgeError(err);
    }
  };
}
