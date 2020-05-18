import {McloudProfile} from './mcloud/mcloud.profile';
import {ProfileAddress} from './address/address.profile';
import {ProfileFolder} from './folder.profile';
import {TestProfile} from './test/test.profile';
import {ProfileOrganization} from './address/organization.profile';

export const profiles = [
  McloudProfile,
  TestProfile,
  ProfileAddress,
  ProfileOrganization,
  ProfileFolder
];
