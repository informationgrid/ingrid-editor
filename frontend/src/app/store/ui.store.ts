import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

export type UiState = {
  hideFormHeaderInfos?: string[];
  multiSelectMode?: boolean;
  scrollPosition?: number;
};

const initialState: UiState = {
  hideFormHeaderInfos: [],
  multiSelectMode: false,
  scrollPosition: 0,
};

export const UiStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => ({
    setHideFormHeaderInfos(hide: string[]): void {
      patchState(store, (_state) => ({ hideFormHeaderInfos: hide }));
    },
    setTreeMultiSelectMode(value: boolean): void {
      patchState(store, (_state) => ({ multiSelectMode: value }));
    },
    setScrollPosition(value: number): void {
      patchState(store, (_state) => ({ scrollPosition: value }));
    },
  })),
);
