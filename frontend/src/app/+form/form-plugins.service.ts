import {Injectable} from '@angular/core';
import {FolderPlugin, PublishPlugin} from '../+behaviours';

@Injectable()
export class FormPluginsService {

  constructor(publishPlugin: PublishPlugin,
              folderPlugin: FolderPlugin) {
    publishPlugin.register();
    folderPlugin.register();
  }
}
