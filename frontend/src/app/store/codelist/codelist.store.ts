import { Injectable } from "@angular/core";
import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";
import { Codelist } from "./codelist.model";

export interface CodelistState extends EntityState<Codelist> {
  catalogCodelists: Codelist[];
}

const initialState = {
  catalogCodelists: [],
};

@Injectable({ providedIn: "root" })
@StoreConfig({ name: "codelist" })
export class CodelistStore extends EntityStore<CodelistState, Codelist> {
  constructor() {
    super(initialState);
  }
}
