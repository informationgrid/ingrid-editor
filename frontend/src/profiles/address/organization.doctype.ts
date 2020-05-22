import {ProfileAddress} from './address.doctype';

export class ProfileOrganization extends ProfileAddress {

  // must be same as DBClass!
  id = 'OrganizationDoc';

  label = 'Organisation';

  iconClass = 'Institution';

  isAddressType = true;

}
