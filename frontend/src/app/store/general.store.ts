import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Query } from "./query/query.model";
import { DocumentAbstract } from "./document/document.model";
import { UpdateDatasetInfo } from "../models/update-dataset-info.model";
import { ShortTreeNode } from "../+form/sidebars/tree/tree.types";

export interface ValidationError {
  name: string;
  errorCode: string;
}

type GeneralState = {
  favorites: { [x: string]: string[] };
  codelistsLoaded: boolean;
  profilesLoaded: boolean;
  activeGroup: number;
  activeQuery: Query;
  openedAddress: DocumentAbstract;
  openedDocument: DocumentAbstract;
  datasetsChanged: UpdateDatasetInfo;
  addressesChanged: UpdateDatasetInfo;
  explicitActiveNode: ShortTreeNode;
  explicitActiveNodeAddress: ShortTreeNode;
  activeTreeNodes: number[];
  activeAddressTreeNodes: number[];
  isDocumentLoading: boolean;
  breadcrumb: {
    document: ShortTreeNode[];
    address: ShortTreeNode[];
  };
  needsDocumentReload: boolean;
  needsAddressReload: boolean;
  recentAddresses: { [catalogId: string]: DocumentAbstract[] };
  serverValidationErrors: ValidationError[];
  latestDocuments: DocumentAbstract[];
  latestAddresses: DocumentAbstract[];
  latestPublishedDocuments: DocumentAbstract[];
  oldestExpiredDocuments: DocumentAbstract[];
  sessionTimeoutIn: number;
};

const initialState: GeneralState = {
  favorites: {},
  codelistsLoaded: false,
  profilesLoaded: false,
  activeGroup: null,
  activeQuery: null,
  openedAddress: null,
  openedDocument: null,
  datasetsChanged: null,
  addressesChanged: null,
  explicitActiveNode: null,
  explicitActiveNodeAddress: null,
  activeTreeNodes: [],
  activeAddressTreeNodes: [],
  isDocumentLoading: false,
  breadcrumb: {
    document: [],
    address: [],
  },
  needsDocumentReload: false,
  needsAddressReload: false,
  recentAddresses: {},
  serverValidationErrors: [],
  latestDocuments: [],
  latestAddresses: [],
  latestPublishedDocuments: [],
  oldestExpiredDocuments: [],
  sessionTimeoutIn: -1,
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
    getExplicitActiveNode(isAddress: boolean): ShortTreeNode {
      if (isAddress) return store.explicitActiveNodeAddress();
      else return store.explicitActiveNode();
    },
    setExplicitActiveNode(node: ShortTreeNode, isAddress: boolean): void {
      if (isAddress) patchState(store, { explicitActiveNodeAddress: node });
      else patchState(store, { explicitActiveNode: node });
    },
    setActiveTreeNodes(docIds: number[], isAddress: boolean): void {
      if (isAddress) patchState(store, { activeAddressTreeNodes: docIds });
      else patchState(store, { activeTreeNodes: docIds });
    },
    setOpenedDocument(doc: DocumentAbstract): void {
      patchState(store, (_state) => ({ openedDocument: doc }));
    },
    setOpenedAddress(address: DocumentAbstract): void {
      patchState(store, (_state) => ({ openedAddress: address }));
    },
    getOpenedDocument(isAddress: boolean): DocumentAbstract {
      return isAddress ? store.openedAddress() : store.openedDocument();
    },
    setDatasetsChanged(info: UpdateDatasetInfo, isAddress: boolean): void {
      if (isAddress)
        patchState(store, (_state) => ({ addressesChanged: info }));
      else patchState(store, (_state) => ({ datasetsChanged: info }));
    },
    getDatasetsChanged(forAddress: boolean): UpdateDatasetInfo {
      if (forAddress) return store.addressesChanged();
      else return store.datasetsChanged();
    },
    setDocumentLoading(value: boolean): void {
      patchState(store, { isDocumentLoading: value });
    },
    setBreadCrumb(path: ShortTreeNode[], isAddress: boolean) {
      if (isAddress)
        patchState(store, (state) => ({
          breadcrumb: { ...state.breadcrumb, address: path },
        }));
      else
        patchState(store, (state) => ({
          breadcrumb: { ...state.breadcrumb, document: path },
        }));
    },
    getNeedsReload(forAddress: boolean): boolean {
      if (forAddress) return store.needsAddressReload();
      else return store.needsDocumentReload();
    },
    setNeedsReload(forAddress: boolean, value: boolean): void {
      if (forAddress)
        patchState(store, (_state) => ({ needsAddressReload: value }));
      else patchState(store, (_state) => ({ needsDocumentReload: value }));
    },
    setServerValidationErrors(errors: ValidationError[]): void {
      patchState(store, (_state) => ({ serverValidationErrors: errors }));
    },
    setLatestDocuments(docs: DocumentAbstract[]): void {
      patchState(store, (_state) => ({ latestDocuments: docs }));
    },
    setLatestPublishedDocuments(docs: DocumentAbstract[]): void {
      patchState(store, (_state) => ({ latestPublishedDocuments: docs }));
    },
    setOldestExpiredDocuments(docs: DocumentAbstract[]): void {
      patchState(store, (_state) => ({ oldestExpiredDocuments: docs }));
    },
    setLatestAddresses(docs: DocumentAbstract[]): void {
      patchState(store, (_state) => ({ latestAddresses: docs }));
    },
    setRecentAddresses(docs: {
      [catalogId: string]: DocumentAbstract[];
    }): void {
      patchState(store, (_state) => ({ recentAddresses: docs }));
    },
    setSessionTimeout(value: number): void {
      patchState(store, (_state) => ({ sessionTimeoutIn: value }));
    },
  })),
);
