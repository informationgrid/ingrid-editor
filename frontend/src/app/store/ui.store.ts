import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

export type UiState = {
  hideFormHeaderInfos: string[];
};

const initialState: UiState = {
  hideFormHeaderInfos: [],
};

export const UiStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => ({
    setHideFormHeaderInfos(hide: string[]): void {
      patchState(store, (_state) => ({ hideFormHeaderInfos: hide }));
    },
  })),
);
