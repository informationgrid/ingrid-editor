import { Injectable } from "@angular/core";
import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";
import { ContextHelpAbstract } from "./context-help.model";

export interface ContexthelpState extends EntityState<ContextHelpAbstract> {}

@Injectable({ providedIn: "root" })
@StoreConfig({ name: "contexthelp" })
export class ContextHelpStore extends EntityStore<
  ContexthelpState,
  ContextHelpAbstract
> {
  constructor() {
    super();
  }

  akitaPreAddEntity(x: Readonly<ContextHelpAbstract>): ContextHelpAbstract {
    return {
      ...x,
      id: [x.profile, x.docType, x.fieldId].join("_"),
    };
  }
}
