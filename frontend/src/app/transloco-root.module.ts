import { HttpClient } from "@angular/common/http";
import {
  Translation,
  TRANSLOCO_CONFIG,
  TRANSLOCO_LOADER,
  translocoConfig,
  TranslocoLoader,
  TranslocoModule,
} from "@ngneat/transloco";
import { Injectable, NgModule } from "@angular/core";
import { environment } from "../environments/environment";
import { ConfigService } from "./services/config/config.service";
import { map, switchMap } from "rxjs/operators";
import { combineLatest } from "rxjs";

@Injectable({ providedIn: "root" })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  getTranslation(lang: string) {
    return this.configService.$userInfo.pipe(
      switchMap((info) => {
        const profile = info?.currentCatalog?.type;

        return combineLatest([
          this.http.get<Translation>(`/assets/i18n/${lang}.json`),
          this.http.get<Translation>(`/assets/${profile}/i18n/${lang}.json`),
        ]).pipe(map((files) => ({ ...files[0], ...files[1] })));
      })
    );
  }
}

@NgModule({
  exports: [TranslocoModule],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ["de", "en"],
        defaultLang: "de",
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: environment.production,
      }),
    },
    { provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader },
  ],
})
export class TranslocoRootModule {}
