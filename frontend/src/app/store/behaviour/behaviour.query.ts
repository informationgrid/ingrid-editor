import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { BehaviourStore, BehaviourState } from './behaviour.store';

@Injectable({ providedIn: 'root' })
export class BehaviourQuery extends QueryEntity<BehaviourState> {

  constructor(protected store: BehaviourStore) {
    super(store);
  }

}
