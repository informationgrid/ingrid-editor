import {Injectable, OnDestroy} from '@angular/core';
import {PublishPlugin} from '../+behaviours';
import {DeleteDocsPlugin} from '../+behaviours/toolbar/deleteDocs/delete-docs.plugin';
import {FolderPlugin} from './dialogs/folder/folder.plugin';
import {CopyCutPastePlugin} from './dialogs/copy-cut-paste/copy-cut-paste.plugin';
import {Plugin} from '../+behaviours/plugin';

@Injectable()
export class FormPluginsService implements OnDestroy {

  private plugins: Plugin[] = [];

  constructor(publishPlugin: PublishPlugin,
              folderPlugin: FolderPlugin,
              copyCutPastePlugin: CopyCutPastePlugin,
              deletePlugin: DeleteDocsPlugin) {

    this.plugins.push(publishPlugin, folderPlugin, copyCutPastePlugin, deletePlugin);
    this.plugins.forEach(p => p.register());
  }

  ngOnDestroy(): void {
    this.plugins.forEach(p => p.unregister());
  }

}
