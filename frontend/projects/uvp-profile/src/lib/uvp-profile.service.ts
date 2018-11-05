import {Injectable} from '@angular/core';
import {ApiService} from 'api';
import {UvpProfileComponent} from "./uvp-profile.component";

@Injectable({
  providedIn: 'root'
})
export class UvpProfileService {

  constructor(api: ApiService) {
    console.log('UVP Profile initialized');

    api.addMenu('New Menu Item', 'uvpSpecialPath', 'uvp-profile#UvpProfileModule');
    api.setFormProfiles(['form profile 1', 'form profile 2']);
  }
}
