import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
import { enableAkitaProdMode, persistState } from "@datorama/akita";

// add scrollto polyfill for ie11
import smoothscroll from "smoothscroll-polyfill";
smoothscroll.polyfill();

if (environment.production) {
  enableProdMode();
  enableAkitaProdMode();
}

persistState({
  include: ["session"],
  preStorageUpdate: (storeName: string, state: any) => {
    const { currentTab, ...otherUiState } = state.ui;
    return {
      ui: (state) => otherUiState,
      recentAddresses: state.recentAddresses,
    };
  },
});

platformBrowserDynamic().bootstrapModule(AppModule);
