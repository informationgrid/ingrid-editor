import { Injectable } from '@angular/core';
import {EntityState, EntityStore, MultiActiveState, StoreConfig} from '@datorama/akita';

export interface PluginInfo {
  id: string;
  title: string;
  description: string;
  initialActive?: boolean;
  data?: any;
}

export interface BehaviourState extends EntityState<PluginInfo>, MultiActiveState {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'behaviour' })
export class BehaviourStore extends EntityStore<BehaviourState> {

  constructor() {
    super();
  }

}

