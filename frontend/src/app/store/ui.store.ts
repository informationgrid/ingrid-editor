import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

export type UiState = {
  hideFormHeaderInfos?: string[];
  multiSelectMode?: boolean;
  scrollPosition?: number;
  textAreaHeights: any;
  sidebarExpanded?: boolean;
  sidebarWidth?: number;
  showJSONView?: boolean;
  userTableWidth?: number;
  toggleFieldsButtonShowAll?: boolean;
  currentTab: {
    research: string;
    manage: string;
    importExport: string;
    catalogs: string;
  };
};

const initialState: UiState = {
  hideFormHeaderInfos: [],
  multiSelectMode: false,
  scrollPosition: 0,
  textAreaHeights: {},
  sidebarExpanded: true,
  sidebarWidth: 30,
  showJSONView: false,
  userTableWidth: 35,
  toggleFieldsButtonShowAll: false,
  currentTab: {
    research: null,
    manage: null,
    importExport: null,
    catalogs: null,
  },
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
    setToggleFieldsButtonShowAll(value: boolean): void {
      patchState(store, (_state) => ({ toggleFieldsButtonShowAll: value }));
    },
    toggleJsonView(forceValue?: boolean) {
      patchState(store, (state) => ({
        showJSONView: forceValue ?? !state.showJSONView,
      }));
    },
    setTextAreaHeights(value: any) {
      patchState(store, { textAreaHeights: JSON.parse(JSON.stringify(value)) });
    },
    setSidebarWidth(value: number) {
      patchState(store, (_state) => ({
        sidebarWidth: value,
      }));
    },
    setUserTableWidth(value: number) {
      patchState(store, (_state) => ({
        userTableWidth: value,
      }));
    },
    setSidebarExpanded(value: boolean) {
      patchState(store, { sidebarExpanded: value });
    },
    updateCurrentTab(value: any) {
      patchState(store, (state) => ({
        currentTab: {
          ...state.currentTab,
          value,
        },
      }));
    },
  })),
);
