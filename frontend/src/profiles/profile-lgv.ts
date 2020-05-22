import { UvpDoctype } from './uvp/uvp.doctype';
import { ProfileAddress } from './address/address.doctype';
import { IsoDataPoolingDoctype } from './iso/iso-data-pooling.doctype';
import { IsoInformationSystemDoctype } from './iso/iso-information-system.doctype';
import { IsoLiteratureDoctype } from './iso/iso-literature.doctype';
import { IsoDatasetDoctype } from './iso/iso-dataset.doctype';
import { IsoProjectDoctype } from './iso/iso-project.doctype';
import { IsoServiceDoctype } from './iso/iso-service.doctype';
import { IsoTaskDoctype } from './iso/iso-task.doctype';
import { ProfileFolder } from './folder.doctype';

export const profiles = [
  ProfileFolder,
  ProfileAddress,
  IsoDataPoolingDoctype,
  IsoInformationSystemDoctype,
  IsoLiteratureDoctype,
  IsoDatasetDoctype,
  IsoProjectDoctype,
  IsoServiceDoctype,
  IsoTaskDoctype,
  UvpDoctype
];
