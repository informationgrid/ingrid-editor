import {McloudFormly} from '../app/formly/profiles/mcloud.formly';
import {ProfileAddress} from './address/address.profile';

export const profiles = [
  McloudFormly,
  ProfileAddress
];

window['theProfile'] = profiles;
