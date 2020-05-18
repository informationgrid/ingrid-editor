import {ProfileAddress} from './address.profile';

export class ProfileOrganization extends ProfileAddress {

  // must be same as DBClass!
  id = 'OrganizationDoc';

  label = 'Organisation';

  iconClass = 'Institution';

  isAddressProfile = true;

}
