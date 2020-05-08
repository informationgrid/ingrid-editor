import {PluginToken} from './tokens/plugin.token';
import {SortTreeByTypeBehaviour} from './+behaviours/system/SortTreeByType/sort-tree-by-type.behaviour';
import {DeleteEmptyFoldersBehaviour} from './+behaviours/system/DeleteEmptyFolders/delete-empty-folders.behaviour';

export const pluginProvider = [
  {provide: PluginToken, useClass: SortTreeByTypeBehaviour, multi: true},
  {provide: PluginToken, useClass: DeleteEmptyFoldersBehaviour, multi: true},
];
