import { PluginToken } from "./tokens/plugin.token";
import { SortTreeByTypeBehaviour } from "./+catalog/+behaviours/system/SortTreeByType/sort-tree-by-type.behaviour";
import { AddressTitleBehaviour } from "./+catalog/+behaviours/system/AddressTitle/address-title.behaviour";
import { DeleteReferenceHandlerPlugin } from "./+catalog/+behaviours/system/DeleteReferenceHandler/delete-reference-handler.plugin";

export const pluginProvider = [
  { provide: PluginToken, useClass: SortTreeByTypeBehaviour, multi: true },
  { provide: PluginToken, useClass: AddressTitleBehaviour, multi: true },
  { provide: PluginToken, useClass: DeleteReferenceHandlerPlugin, multi: true },
];
