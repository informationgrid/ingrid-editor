import {McloudProfile} from './mcloud/mcloud.profile';
import {ProfileAddress} from './address/address.profile';
import {ProfileFolder} from './folder.profile';
import {TestProfile} from './test/test.profile';

export const profiles = [
  McloudProfile,
  TestProfile,
  ProfileAddress,
  ProfileFolder
];
