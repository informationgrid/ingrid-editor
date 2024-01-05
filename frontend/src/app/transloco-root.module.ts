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
import { HttpClient } from "@angular/common/http";
import {
  provideTransloco,
  Translation,
  TranslocoLoader,
  TranslocoModule,
} from "@ngneat/transloco";
import { Injectable, isDevMode, NgModule } from "@angular/core";
import { ConfigService } from "./services/config/config.service";
import { catchError, map, switchMap } from "rxjs/operators";
import { combineLatest, of } from "rxjs";
import { deepMerge } from "./services/utils";

@Injectable({ providedIn: "root" })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
  ) {}

  getTranslation(lang: string) {
    return this.configService.$userInfo.pipe(
      switchMap((info) => {
        const profile = info?.currentCatalog?.type;
        const parentProfile = info?.parentProfile;
        const assetsDir =
          this.configService.getConfiguration().contextPath + "assets";

        const sources = [
          this.http.get<Translation>(`${assetsDir}/i18n/${lang}.json`),
          this.http
            .get<Translation>(`${assetsDir}/${profile}/i18n/${lang}.json`)
            .pipe(catchError(() => of({}))),
        ];
        if (parentProfile) {
          sources.push(
            this.http
              .get<Translation>(
                `${assetsDir}/${parentProfile}/i18n/${lang}.json`,
              )
              .pipe(catchError(() => of({}))),
          );
        }
        return combineLatest(sources).pipe(
          map((files) => deepMerge(files[0], files[1], files[2])),
        );
      }),
    );
  }
}

@NgModule({
  exports: [TranslocoModule],
  providers: [
    provideTransloco({
      config: {
        availableLangs: ["de", "en"],
        defaultLang: "de",
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },

      loader: TranslocoHttpLoader,
    }),
  ],
})
export class TranslocoRootModule {}
