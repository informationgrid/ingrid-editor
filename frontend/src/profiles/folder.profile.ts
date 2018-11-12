import { Profile } from '../app/services/formular/profile';
import { TextboxField } from '../app/+form/controls';
import { DocumentService } from '../app/services/document/document.service';
import { CodelistService } from '../app/services/codelist/codelist.service';

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

  constructor(storageService: DocumentService, codelistService: CodelistService) {

  }

  getTitle(doc: any): string {
    return doc.title;
  }

  getTitleFields(): string[] {
    return ['title'];
  }

}
