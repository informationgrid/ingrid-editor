import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";
import { ContexthelpState, ContextHelpStore } from "./context-help.store";
import { ContextHelpAbstract } from "./context-help.model";

@Injectable({
  providedIn: "root",
})
export class ContextHelpQuery extends QueryEntity<
  ContexthelpState,
  ContextHelpAbstract
> {
  constructor(protected store: ContextHelpStore) {
    super(store);
  }

  getContextHelp(
    profile: string,
    docType: string,
    fieldId: string,
  ): ContextHelpAbstract {
    return this.getEntity([profile, docType, fieldId].join("_"));
  }
}
