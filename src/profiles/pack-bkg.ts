import { UVPProfile } from './uvp/uvp.profile';


console.log('I am an external module!');

export const profiles = [
  UVPProfile
];

window['theProfile'] = profiles;
