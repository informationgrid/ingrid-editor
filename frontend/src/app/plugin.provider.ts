import {PluginToken} from './tokens/plugin.token';
import {SortTreeByTypeBehaviour} from './+catalog/+behaviours/system/SortTreeByType/sort-tree-by-type.behaviour';
import {AddressTitleBehaviour} from './+catalog/+behaviours/system/AddressTitle/address-title.behaviour';
import {SessionTimeoutBehaviour} from './+catalog/+behaviours/system/SessionTimeout/session-timeout.behaviour';

export const pluginProvider = [
  {provide: PluginToken, useClass: SessionTimeoutBehaviour, multi: true},
  {provide: PluginToken, useClass: SortTreeByTypeBehaviour, multi: true},
  {provide: PluginToken, useClass: AddressTitleBehaviour, multi: true}
];
