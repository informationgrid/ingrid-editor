import { UVPProfile } from './uvp/uvp.profile';
import { ProfileAddress } from './address/address.profile';
import { IsoDataPoolingProfile } from './iso/iso-data-pooling.profile';
import { IsoInformationSystemProfile } from './iso/iso-information-system.profile';
import { IsoLiteratureProfile } from './iso/iso-literature.profile';
import { IsoDatasetProfile } from './iso/iso-dataset.profile';
import { IsoProjectProfile } from './iso/iso-project.profile';
import { IsoServiceProfile } from './iso/iso-service.profile';
import { IsoTaskProfile } from './iso/iso-task.profile';
import { ProfileFolder } from './folder.profile';

export const profiles = [
  ProfileFolder,
  ProfileAddress,
  IsoDataPoolingProfile,
  IsoInformationSystemProfile,
  IsoLiteratureProfile,
  IsoDatasetProfile,
  IsoProjectProfile,
  IsoServiceProfile,
  IsoTaskProfile,
  UVPProfile
];
