import {PluginToken} from './tokens/plugin.token';
import {SortTreeByTypeBehaviour} from './+behaviours/system/SortTreeByType/sort-tree-by-type.behaviour';
import {AddressTitleBehaviour} from './+behaviours/system/AddressTitle/address-title.behaviour';

export const pluginProvider = [
  {provide: PluginToken, useClass: SortTreeByTypeBehaviour, multi: true},
  {provide: PluginToken, useClass: AddressTitleBehaviour, multi: true}
];
