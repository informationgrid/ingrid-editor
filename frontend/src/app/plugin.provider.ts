import { PluginToken } from "./tokens/plugin.token";
import { PublishPlugin } from "./+form/dialogs/save/publish.plugin";
import { CreateDocumentPlugin } from "./+form/dialogs/create/create-doc.plugin";
import { SavePlugin } from "./+form/dialogs/save/save.plugin";
import { CreateFolderPlugin } from "./+form/dialogs/create/create-folder.plugin";
import { CopyCutPastePlugin } from "./+form/dialogs/copy-cut-paste/copy-cut-paste.plugin";
import { DeleteDocsPlugin } from "./+form/dialogs/delete-docs/delete-docs.plugin";
import { HistoryPlugin } from "./+form/dialogs/history/history.plugin";
import { DeleteEmptyFoldersBehaviour } from "./+catalog/+behaviours/system/DeleteEmptyFolders/delete-empty-folders.behaviour";
import { ShowJsonBehaviour } from "./+catalog/+behaviours/system/ShowJson/show-json.behaviour";
import { TreeModeToolbarBehaviour } from "./+catalog/+behaviours/system/ToolbarStateTreeMode/tree-mode-toolbar.behaviour";
import { PrintViewPlugin } from "./+form/dialogs/print-view/print-view.plugin";
import { TagsBehaviour } from "./+catalog/+behaviours/system/tags/tags.behaviour";
import { AssignedUserBehaviour } from "./+catalog/+behaviours/system/AssignedUser/assigned-user.behaviour";
import { SortTreeByTypeBehaviour } from "./+catalog/+behaviours/system/SortTreeByType/sort-tree-by-type.behaviour";
import { AddressTitleBehaviour } from "./+catalog/+behaviours/system/AddressTitle/address-title.behaviour";
import { DeleteReferenceHandlerPlugin } from "./+catalog/+behaviours/system/DeleteReferenceHandler/delete-reference-handler.plugin";
import { InheritContactDataHandler } from "./+catalog/+behaviours/system/InheritContactDataHandler/inherit-contactdata-handler";
import { AutosavePlugin } from "./+catalog/+behaviours/system/Autosave/autosave.plugin";
import { DefaultUserBehaviour } from "./+catalog/+behaviours/system/User/default-user.behaviour";
import { ShowDocumentPermissionsHandlerPlugin } from "./+catalog/+behaviours/system/ShowDocumentPermissions/show-document-permissions-handler";
import { FieldsToggleButtonBehaviour } from "./+catalog/+behaviours/system/FieldsToggleButton/fields-toggle-button.behaviour";

export const pluginProvider = [
  { provide: PluginToken, useClass: ShowJsonBehaviour, multi: true },
  { provide: PluginToken, useClass: PublishPlugin, multi: true },
  { provide: PluginToken, useClass: CreateDocumentPlugin, multi: true },
  { provide: PluginToken, useClass: SavePlugin, multi: true },
  { provide: PluginToken, useClass: CreateFolderPlugin, multi: true },
  { provide: PluginToken, useClass: CopyCutPastePlugin, multi: true },
  { provide: PluginToken, useClass: DeleteDocsPlugin, multi: true },
  { provide: PluginToken, useClass: HistoryPlugin, multi: true },
  { provide: PluginToken, useClass: TreeModeToolbarBehaviour, multi: true },
  { provide: PluginToken, useClass: PrintViewPlugin, multi: true },
  { provide: PluginToken, useClass: TagsBehaviour, multi: true },
  { provide: PluginToken, useClass: FieldsToggleButtonBehaviour, multi: true },
  { provide: PluginToken, useClass: AssignedUserBehaviour, multi: true },
  {
    provide: PluginToken,
    useClass: DeleteEmptyFoldersBehaviour,
    multi: true,
  },
  { provide: PluginToken, useClass: SortTreeByTypeBehaviour, multi: true },
  { provide: PluginToken, useClass: AddressTitleBehaviour, multi: true },
  {
    provide: PluginToken,
    useClass: DeleteReferenceHandlerPlugin,
    multi: true,
  },
  {
    provide: PluginToken,
    useClass: InheritContactDataHandler,
    multi: true,
  },
  { provide: PluginToken, useClass: AutosavePlugin, multi: true },
  { provide: PluginToken, useClass: DefaultUserBehaviour, multi: true },
  {
    provide: PluginToken,
    useClass: ShowDocumentPermissionsHandlerPlugin,
    multi: true,
  },
];
