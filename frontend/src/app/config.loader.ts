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
import { registerLocaleData } from "@angular/common";
import { ConfigService } from "./services/config/config.service";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { IgeError } from "./models/ige-error";
import de from "@angular/common/locales/de";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "./dialogs/confirm/confirm-dialog.component";
import { initializeKeycloakAndGetUserInfo } from "./keycloak.init";
import { AuthenticationFactory } from "./security/auth.factory";
import { Router } from "@angular/router";
import { Catalog } from "./+catalog/services/catalog.model";
import { firstValueFrom } from "rxjs";
import { TranslocoService } from "@ngneat/transloco";
import { ProfileService } from "./services/profile.service";
import { catchError, filter, map, switchMap, take } from "rxjs/operators";
import { ProfileMapper } from "../profiles/profile.mapper";
import { Type } from "@angular/core";

registerLocaleData(de);

function loadProfile(configService: ConfigService) {
  return new Promise<void>((resolve) => {
    configService.$userInfo
      .pipe(
        filter((info) => ProfileService.userHasAnyCatalog(info)),
        switchMap((info) => ProfileMapper(info.currentCatalog.type)),
        map(({ ProfilePack }) => ProfilePack.getMyComponent() as Type<any>),
        take(1),
        catchError((error) => {
          this.errorService.showJavascriptError(error.message, error.stack);
          throw error;
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
  authFactory: AuthenticationFactory,
  router: Router,
  http: HttpClient,
  dialog: MatDialog,
  translocoService: TranslocoService,
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

  async function redirectToCatalogSpecificRoute(
    router: Router,
    dialog: MatDialog,
  ) {
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
        const commands = getRedirectNavigationCommand(catalogId, urlPath);
        // redirect a bit delayed to complete this navigation first before doing another
        // also make sure dynamically added routes have been already added
        setTimeout(() => router.navigate(commands), 100);
        return;
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
        ).then(() => configService.getCurrentUserInfo());
        return;
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
  }

  return async () => {
    try {
      await configService.load();
      await initializeKeycloakAndGetUserInfo(authFactory, configService);
      await firstValueFrom(translocoService.load("de"));
      await loadProfile.call(this, configService);
      console.debug("FINISHED APP INIT");

      return await redirectToCatalogSpecificRoute(router, dialog);
    } catch (err) {
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
