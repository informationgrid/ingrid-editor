import de from "../assets/i18n/de.json";
import {
  TranslocoTestingModule,
  TranslocoTestingOptions,
} from "@ngneat/transloco";

export function getTranslocoModule(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: { de },
    translocoConfig: {
      availableLangs: ["de"],
      defaultLang: "de",
    },
    preloadLangs: true,
    ...options,
  });
}
