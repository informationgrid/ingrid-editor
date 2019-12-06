import {DocumentService} from '../app/services/document/document.service';
import {CodelistService} from '../app/services/codelist/codelist.service';
import {BaseProfile} from './base.profile';

export class ProfileFolder extends BaseProfile {
  id = 'FOLDER';

  label = 'Ordner';

  treeIconClass = 'fa fa-folder-o';

  constructor(storageService: DocumentService, codelistService: CodelistService) {
    super();
  }

  getTitle(doc: any): string {
    return doc.title;
  }

  getTitleFields(): string[] {
    return ['title'];
  }

}
