import { Profile } from '../app/services/formular/profile';
import { TextboxField } from '../app/+form/controls';
import { DocumentService } from '../app/services/document/document.service';
import { CodelistService } from '../app/services/codelist/codelist.service';
import {FormlyFieldConfig} from '@ngx-formly/core';

export class ProfileFolder implements Profile {
  id = 'FOLDER';

  label = 'Ordner';

  treeIconClass = 'fa fa-folder-o';

  fields = <FormlyFieldConfig[]>[
    {
      key: 'title',
      type: 'input',
      wrappers: ['panel'],
      templateOptions: {
        externalLabel: 'Label'
      }
    }
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
