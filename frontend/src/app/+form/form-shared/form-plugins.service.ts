import {Injectable, OnDestroy} from '@angular/core';
import {DeleteDocsPlugin} from '../dialogs/delete-docs/delete-docs.plugin';
import {FolderPlugin} from '../dialogs/folder/folder.plugin';
import {CopyCutPastePlugin} from '../dialogs/copy-cut-paste/copy-cut-paste.plugin';
import {Plugin} from '../../+behaviours/plugin';
import {PublishPlugin} from '../dialogs/publish/publish.plugin';
import {PrintViewPlugin} from '../dialogs/print-view/print-view.plugin';
import {NewDocumentPlugin} from '../dialogs/new-doc/new-doc.plugin';
import {SavePlugin} from '../dialogs/save/save.plugin';

@Injectable()
export class FormPluginsService implements OnDestroy {

  private plugins: Plugin[] = [];

  constructor(publishPlugin: PublishPlugin,
              newDoc: NewDocumentPlugin,
              saveDoc: SavePlugin,
              folderPlugin: FolderPlugin,
              copyCutPastePlugin: CopyCutPastePlugin,
              printPlugin: PrintViewPlugin,
              deletePlugin: DeleteDocsPlugin) {

    this.plugins.push(publishPlugin, newDoc, saveDoc, folderPlugin, copyCutPastePlugin, deletePlugin, printPlugin);
    this.plugins.forEach(p => p.register());
  }

  ngOnDestroy(): void {
    this.plugins.forEach(p => p.unregister());
  }

}
