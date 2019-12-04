import {Injectable} from '@angular/core';
import {PublishPlugin} from '../+behaviours';
import {DeleteDocsPlugin} from '../+behaviours/toolbar/deleteDocs/delete-docs.plugin';
import {FolderPlugin} from './dialogs/folder/folder.plugin';
import {CopyCutPastePlugin} from './dialogs/copy-cut-paste/copy-cut-paste.plugin';

@Injectable()
export class FormPluginsService {

  constructor(publishPlugin: PublishPlugin,
              folderPlugin: FolderPlugin,
              copyCutPastePlugin: CopyCutPastePlugin,
              deletePlugin: DeleteDocsPlugin) {
    publishPlugin.register();
    folderPlugin.register();
    copyCutPastePlugin.register();
    deletePlugin.register();
  }
}
