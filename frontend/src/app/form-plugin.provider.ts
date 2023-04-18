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
import { IsoViewPlugin } from "./+form/dialogs/iso-view/iso-view.plugin";

export const formPluginProvider = [
  { provide: FormPluginToken, useClass: ShowJsonBehaviour, multi: true },
  { provide: FormPluginToken, useClass: PublishPlugin, multi: true },
  { provide: FormPluginToken, useClass: CreateDocumentPlugin, multi: true },
  { provide: FormPluginToken, useClass: SavePlugin, multi: true },
  { provide: FormPluginToken, useClass: CreateFolderPlugin, multi: true },
  { provide: FormPluginToken, useClass: CopyCutPastePlugin, multi: true },
  // {provide: FormPluginToken, useClass: PrintViewPlugin, multi: true},
  { provide: FormPluginToken, useClass: DeleteDocsPlugin, multi: true },
  { provide: FormPluginToken, useClass: HistoryPlugin, multi: true },
  { provide: FormPluginToken, useClass: TreeModeToolbarBehaviour, multi: true },
  { provide: FormPluginToken, useClass: IsoViewPlugin, multi: true },
  { provide: FormPluginToken, useClass: PrintViewPlugin, multi: true },
  {
    provide: FormPluginToken,
    useClass: DeleteEmptyFoldersBehaviour,
    multi: true,
  },
];
