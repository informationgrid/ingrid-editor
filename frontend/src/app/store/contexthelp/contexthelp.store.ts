import {Injectable} from '@angular/core';
import {EntityState, EntityStore, StoreConfig} from '@datorama/akita';
import {ContexthelpAbstract} from "./contexthelp.model";

export interface ContexthelpState extends EntityState<ContexthelpAbstract> {
  isInitialized: boolean
}

export function createContexthelp(params: Partial<ContexthelpAbstract>) {
  return <Partial<ContexthelpAbstract>>{
    isInitialized: false
  } as ContexthelpAbstract;
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'contexthelp', idKey: 'fakeId'})
export class ContexthelpStore extends EntityStore<ContexthelpState, ContexthelpAbstract> {

  constructor() {
    super(createContexthelp(null));
  }

  akitaPreAddEntity(x: Readonly<ContexthelpAbstract>): ContexthelpAbstract {
    return {
      ...x,
      fakeId: [x.profile, x.docType, x.fieldId].join(',')
    };
  }

}

