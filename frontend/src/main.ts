/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
