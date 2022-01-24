import { Injectable } from "@angular/core";
import { SessionStore } from "../store/session.store";
import { SessionQuery } from "../store/session.query";
import { Observable } from "rxjs";

export type TabPage = "research" | "manage" | "import" | "catalog";

@Injectable({
  providedIn: "root",
})
export class SessionService {
  constructor(
    private sessionStore: SessionStore,
    private sessionQuery: SessionQuery
  ) {}

  updateCurrentTab(page: TabPage, tabIndex: number) {
    this.sessionStore.update((state) => {
      const newTabState = {};
      newTabState[page] = tabIndex;
      return {
        ...state,
        ui: {
          ...state.ui,
          currentTab: {
            ...state.ui.currentTab,
            ...newTabState,
          },
        },
      };
    });
  }

  observeTabChange(page: TabPage): Observable<number> {
    return this.sessionQuery.select((state) => state.ui.currentTab[page]);
  }
}
