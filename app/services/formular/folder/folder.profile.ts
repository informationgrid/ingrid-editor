import {TextboxField} from '../../../+form/controls/index';
import {Profile} from '../profile';

export class FolderProfile implements Profile {

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