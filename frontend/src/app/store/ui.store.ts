/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

export type UiState = {
  hideFormHeaderInfos?: string[];
  multiSelectMode?: boolean;
  scrollPosition?: number;
  textAreaHeights: any;
  sidebarExpanded?: boolean;
  sidebarWidth?: number;
  showJSONView?: boolean;
  llmPromptView?: boolean;
  userTableWidth?: number;
  toggleFieldsButtonShowAll?: boolean;
  currentSubpage: {
    research: string;
    manage: string;
    importExport: string;
    catalogs: string;
    form: { id: string };
    address: { id: string };
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
  llmPromptView: false,
  userTableWidth: 35,
  toggleFieldsButtonShowAll: false,
  currentSubpage: {
    research: null,
    manage: null,
    importExport: null,
    catalogs: null,
    form: null,
    address: null,
  },
};

export const UiStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => ({
    setHideFormHeaderInfos(hide: string[]): void {
      patchState(store, { hideFormHeaderInfos: hide });
    },
    setTreeMultiSelectMode(value: boolean): void {
      patchState(store, { multiSelectMode: value });
    },
    setScrollPosition(value: number): void {
      patchState(store, { scrollPosition: value });
    },
    setToggleFieldsButtonShowAll(value: boolean): void {
      patchState(store, { toggleFieldsButtonShowAll: value });
    },
    toggleJsonView(forceValue?: boolean) {
      patchState(store, (state) => ({
        llmPromptView: false,
        showJSONView: forceValue ?? !state.showJSONView,
      }));
    },
    toggleLLMPromptView(forceValue?: boolean) {
      patchState(store, (state) => ({
        showJSONView: false,
        llmPromptView: forceValue ?? !state.llmPromptView,
      }));
    },
    setTextAreaHeights(value: any) {
      patchState(store, { textAreaHeights: JSON.parse(JSON.stringify(value)) });
    },
    setSidebarWidth(value: number) {
      patchState(store, { sidebarWidth: value });
    },
    setUserTableWidth(value: number) {
      patchState(store, { userTableWidth: value });
    },
    setSidebarExpanded(value: boolean) {
      patchState(store, { sidebarExpanded: value });
    },
    updateCurrentSubpage(value: any) {
      patchState(store, (state) => ({
        currentSubpage: {
          ...state.currentSubpage,
          ...value,
        },
      }));
    },
  })),
);
