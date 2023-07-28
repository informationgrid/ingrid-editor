import { FormPluginToken } from "./tokens/plugin.token";
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

export const formPluginProvider = [
  { provide: FormPluginToken, useClass: ShowJsonBehaviour, multi: true },
  { provide: FormPluginToken, useClass: PublishPlugin, multi: true },
  { provide: FormPluginToken, useClass: CreateDocumentPlugin, multi: true },
  { provide: FormPluginToken, useClass: SavePlugin, multi: true },
  { provide: FormPluginToken, useClass: CreateFolderPlugin, multi: true },
  { provide: FormPluginToken, useClass: CopyCutPastePlugin, multi: true },
  { provide: FormPluginToken, useClass: DeleteDocsPlugin, multi: true },
  { provide: FormPluginToken, useClass: HistoryPlugin, multi: true },
  { provide: FormPluginToken, useClass: TreeModeToolbarBehaviour, multi: true },
  { provide: FormPluginToken, useClass: PrintViewPlugin, multi: true },
  { provide: FormPluginToken, useClass: TagsBehaviour, multi: true },
  { provide: FormPluginToken, useClass: AssignedUserBehaviour, multi: true },
  {
    provide: FormPluginToken,
    useClass: DeleteEmptyFoldersBehaviour,
    multi: true,
  },
  { provide: FormPluginToken, useClass: SortTreeByTypeBehaviour, multi: true },
  { provide: FormPluginToken, useClass: AddressTitleBehaviour, multi: true },
  {
    provide: FormPluginToken,
    useClass: DeleteReferenceHandlerPlugin,
    multi: true,
  },
  {
    provide: FormPluginToken,
    useClass: InheritContactDataHandler,
    multi: true,
  },
  { provide: FormPluginToken, useClass: AutosavePlugin, multi: true },
  { provide: FormPluginToken, useClass: DefaultUserBehaviour, multi: true },
  {
    provide: FormPluginToken,
    useClass: ShowDocumentPermissionsHandlerPlugin,
    multi: true,
  },
];
