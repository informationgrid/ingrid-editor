import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UvpProfileService {

  constructor() {
    console.log('UVP Profile initialized');

    //api.addMenu('New Menu Item', 'uvpSpecialPath', 'uvp-profile#UvpProfileModule');
    //api.setFormProfiles(['form profile 1', 'form profile 2']);
  }
}
