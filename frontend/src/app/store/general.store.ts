import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Query } from "./query/query.model";

type GeneralState = {
  favorites: { [x: string]: string[] };
  codelistsLoaded: boolean;
  profilesLoaded: boolean;
  activeGroup: number;
  activeQuery: Query;
};

const initialState: GeneralState = {
  favorites: {},
  codelistsLoaded: false,
  profilesLoaded: false,
  activeGroup: null,
  activeQuery: null,
};

export const GeneralStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => ({
    setCodelistsLoaded(): void {
      patchState(store, (_state) => ({ codelistsLoaded: true }));
    },
    setProfilesLoaded(): void {
      patchState(store, (_state) => ({ profilesLoaded: true }));
    },
    updateFavorites(favorites): void {
      patchState(store, (_state) => ({ favorites: favorites }));
    },
    setActiveGroup(id: number): void {
      patchState(store, (_state) => ({ activeGroup: id }));
    },
    setActiveQuery(query: Query): void {
      patchState(store, (_state) => ({ activeQuery: query }));
    },
  })),
);
