import {TextboxField} from '../../../+form/controls/index';
import {Profile} from '../profile';
import {Injectable} from '@angular/core';

@Injectable()
export class FolderProfile implements Profile {

  id = 'FOLDER';

  label = 'Ordner';

  treeIconClass = 'fa fa-folder-o';

  profile = [

    new TextboxField({
      key: 'title',
      label: 'Label'
    })
  ];

  getTitle(doc: any): string {
    return doc.title;
  }

  getTitleFields(): string[] {
    return ['title'];
  }

}
