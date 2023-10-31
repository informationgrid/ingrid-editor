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
