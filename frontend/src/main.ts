import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
import { enableAkitaProdMode, persistState } from "@datorama/akita";

if (environment.production) {
  enableProdMode();
  enableAkitaProdMode();
}

persistState({
  include: ["session"],
  preStorageUpdate: (storeName: string, state: any) => {
    const { currentTab, toggleFieldsButtonShowAll, ...otherUiState } = state.ui;
    return {
      ui: otherUiState,
      recentAddresses: state.recentAddresses,
    };
  },
  preStoreUpdate(storeName: string, state: any, initialState: any): any {
    // add initial values for fields that are not persisted
    if (!state.ui) state.ui = { ...initialState.ui };
    state.ui.currentTab = initialState.ui.currentTab;
    return state;
  },
});

platformBrowserDynamic().bootstrapModule(AppModule);
