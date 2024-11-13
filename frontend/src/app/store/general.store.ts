import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

type GeneralState = {
  favorites: { [x: string]: string[] };
  codelistsLoaded: boolean;
};

const initialState: GeneralState = {
  favorites: {},
  codelistsLoaded: false,
};

export const GeneralStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => ({
    setCodelistsLoaded(): void {
      patchState(store, (_state) => ({ codelistsLoaded: true }));
    },
    updateFavorites(favorites): void {
      patchState(store, (_state) => ({ favorites: favorites }));
    },
  })),
);
