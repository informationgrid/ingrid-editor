import {FormularService} from '../formular/formular.service';
import {EventManager} from '@angular/platform-browser';
import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {ClickAndChangeTitleBehaviour} from '../../behaviours';
import {MapAndChangeTitleBehaviour} from '../../plugins/demo/behaviours/MapAndChangeTitle/map-and-change-title.behaviour';
import {AddControlBehaviour} from '../../plugins/demo/behaviours/AddControl/addControl.behaviour';
import {StorageService} from "../storage/storage.service";

export interface Behaviour {
  id: string;
  title: string;
  description: string;
  defaultActive: boolean;
  forProfile: string;
  isActive?: boolean;
  register: (form: FormGroup, eventManager: EventManager) => void;
  unregister: () => void;
  controls?: any[];
  outer?: any;
}

@Injectable()
export class BehavioursDefault {

  constructor(private formService: FormularService, private storageService: StorageService) {
  }

  /**
   * The definition of all behaviours.
   * @type {{id: string; title: string; description: string; defaultActive: boolean; outer: BehavioursDefault; register: Function}[]}
   */
  behaviours: Behaviour[] = [
    new ClickAndChangeTitleBehaviour( this.storageService ),
    new MapAndChangeTitleBehaviour( this.formService ),
    new AddControlBehaviour( this.formService )
  ];
}