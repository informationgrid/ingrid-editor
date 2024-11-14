import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Query } from "./query/query.model";
import { DocumentAbstract } from "./document/document.model";
import { UpdateDatasetInfo } from "../models/update-dataset-info.model";
import { ShortTreeNode } from "../+form/sidebars/tree/tree.types";

type GeneralState = {
  favorites: { [x: string]: string[] };
  codelistsLoaded: boolean;
  profilesLoaded: boolean;
  activeGroup: number;
  activeQuery: Query;
  openedAddress: DocumentAbstract;
  openedDocument: DocumentAbstract;
  datasetsChanged: UpdateDatasetInfo;
  explicitActiveNode: ShortTreeNode;
  activeTreeNodes: number[];
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
  explicitActiveNode: null,
  activeTreeNodes: [],
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
    setExplicitActiveNode(node: ShortTreeNode): void {
      patchState(store, (_state) => ({ explicitActiveNode: node }));
    },
    setActiveTreeNodes(docIds: number[]): void {
      patchState(store, (_state) => ({ activeTreeNodes: docIds }));
    },
    setOpenedDocument(doc: DocumentAbstract): void {
      patchState(store, (_state) => ({ openedDocument: doc }));
    },
    setOpenedAddress(address: DocumentAbstract): void {
      patchState(store, (_state) => ({ openedAddress: address }));
    },
  })),
);
