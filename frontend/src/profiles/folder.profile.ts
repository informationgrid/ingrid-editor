import {BaseProfile} from './base.profile';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileFolder extends BaseProfile {

  id = 'FOLDER';

  label = 'Ordner';

  iconClass = 'Ordner';

}
