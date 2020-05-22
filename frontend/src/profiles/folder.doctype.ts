import {BaseDoctype} from './base.doctype';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileFolder extends BaseDoctype {

  id = 'FOLDER';

  label = 'Ordner';

  iconClass = 'Ordner';

}
