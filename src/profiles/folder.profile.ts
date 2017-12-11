import { Profile } from '../app/services/formular/profile';
import { TextboxField } from '../app/+form/controls';
import { StorageService } from '../app/services/storage/storage.service';
import { CodelistService } from '../app/+form/services/codelist.service';

export class ProfileFolder implements Profile {
  id = 'FOLDER';

  label = 'Ordner';

  treeIconClass = 'fa fa-folder-o';

  fields = [

    new TextboxField({
      key: 'title',
      label: 'Label'
    })
  ];

  constructor(storageService: StorageService, codelistService: CodelistService) {

  }

  getTitle(doc: any): string {
    return doc.title;
  }

  getTitleFields(): string[] {
    return ['title'];
  }

}
