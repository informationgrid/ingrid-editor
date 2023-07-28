import { PluginToken } from "./tokens/plugin.token";
import { SortTreeByTypeBehaviour } from "./+catalog/+behaviours/system/SortTreeByType/sort-tree-by-type.behaviour";
import { AddressTitleBehaviour } from "./+catalog/+behaviours/system/AddressTitle/address-title.behaviour";
import { DeleteReferenceHandlerPlugin } from "./+catalog/+behaviours/system/DeleteReferenceHandler/delete-reference-handler.plugin";
import { InheritContactDataHandler } from "./+catalog/+behaviours/system/InheritContactDataHandler/inherit-contactdata-handler";
import { AutosavePlugin } from "./+catalog/+behaviours/system/Autosave/autosave.plugin";
import { DefaultUserBehaviour } from "./+catalog/+behaviours/system/User/default-user.behaviour";
import { ShowDocumentPermissionsHandlerPlugin } from "./+catalog/+behaviours/system/ShowDocumentPermissions/show-document-permissions-handler";

export const pluginProvider = [
  { provide: PluginToken, useClass: SortTreeByTypeBehaviour, multi: true },
  { provide: PluginToken, useClass: AddressTitleBehaviour, multi: true },
  { provide: PluginToken, useClass: DeleteReferenceHandlerPlugin, multi: true },
  { provide: PluginToken, useClass: InheritContactDataHandler, multi: true },
  { provide: PluginToken, useClass: AutosavePlugin, multi: true },
  { provide: PluginToken, useClass: DefaultUserBehaviour, multi: true },
  // { provide: PluginToken, useClass: AssignedUserBehaviour, multi: true },
  {
    provide: PluginToken,
    useClass: ShowDocumentPermissionsHandlerPlugin,
    multi: true,
  },
];
