import {FormGroup} from '@angular/forms';
import {EventManager} from '@angular/platform-browser';

export interface Behaviour {
  id: string;
  title: string;
  description: string;
  defaultActive: boolean;
  forProfile?: string;
  isActive?: boolean;
  register: (form: FormGroup, eventManager: EventManager) => void;
  unregister: () => void;
  controls?: any[];
  outer?: any;
  isProfileBehaviour?: boolean;
  _state?: string;
}
