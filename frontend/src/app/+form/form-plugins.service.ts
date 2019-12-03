import {Injectable} from '@angular/core';
import {FolderPlugin, PublishPlugin} from '../+behaviours';
import {DeleteDocsPlugin} from '../+behaviours/toolbar/deleteDocs/delete-docs.plugin';

@Injectable()
export class FormPluginsService {

  constructor(publishPlugin: PublishPlugin,
              folderPlugin: FolderPlugin,
              deletePlugin: DeleteDocsPlugin) {
    publishPlugin.register();
    folderPlugin.register();
    deletePlugin.register();
  }
}
