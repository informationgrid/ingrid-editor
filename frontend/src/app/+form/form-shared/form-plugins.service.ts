import {Injectable, OnDestroy} from '@angular/core';
import {DeleteDocsPlugin} from '../dialogs/delete-docs/delete-docs.plugin';
import {FolderPlugin} from '../dialogs/folder/folder.plugin';
import {CopyCutPastePlugin} from '../dialogs/copy-cut-paste/copy-cut-paste.plugin';
import {Plugin} from '../../+behaviours/plugin';
import {PublishPlugin} from '../dialogs/publish/publish.plugin';
import {PrintViewPlugin} from '../dialogs/print-view/print-view.plugin';
import {NewDocumentPlugin} from '../dialogs/new-document/new-doc.plugin';
import {SavePlugin} from '../dialogs/save/save.plugin';
import {HistoryPlugin} from '../dialogs/history/history.plugin';

@Injectable()
export class FormPluginsService implements OnDestroy {

  private plugins: Plugin[] = [];

  constructor(publishPlugin: PublishPlugin,
              newDoc: NewDocumentPlugin,
              saveDoc: SavePlugin,
              folderPlugin: FolderPlugin,
              copyCutPastePlugin: CopyCutPastePlugin,
              printPlugin: PrintViewPlugin,
              deletePlugin: DeleteDocsPlugin,
              historyPlugin: HistoryPlugin) {

    this.plugins.push(publishPlugin, newDoc, saveDoc, folderPlugin, copyCutPastePlugin, deletePlugin, printPlugin, historyPlugin);
    this.plugins.forEach(p => p.register());
  }

  ngOnDestroy(): void {
    this.plugins.forEach(p => p.unregister());
  }

  setAddressConfiguration() {
    this.plugins.forEach(p => p.setForAddress());
  }

}
