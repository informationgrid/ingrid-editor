import {McloudFormly} from '../app/formly/profiles/mcloud.formly';
import {ProfileAddress} from './address/address.profile';
import {ProfileFolder} from './folder.profile';

export const profiles = [
  McloudFormly,
  ProfileAddress,
  ProfileFolder
];

window['theProfile'] = profiles;
