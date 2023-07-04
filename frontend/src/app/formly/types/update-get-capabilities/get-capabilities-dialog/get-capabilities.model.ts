import { DocumentState } from "../../../../models/ige-document";

export interface GetCapabilitiesAnalysis {
  addressParent: number;

  title: string;
  description: string;
  versions: KeyValue[];
  fees: KeyValue;
  accessConstraints: KeyValue[];
  serviceType: string;
  dataServiceType: string;
  onlineResources: Url[];
  keywords: string[];
  boundingBoxes: Location[];
  spatialReferenceSystems: KeyValue[];
  address: Address;
  operations: Operation[];
  resourceLocators: Url[];
  timeReference: TimeReference[];
  timeSpan: TimeReference;
  conformities: Conformity[];
  coupledResources: CoupledResource[];
}

export interface CoupledResource {
  uuid: string;
  exists: boolean;
  title: string;
  description: string;
  objectIdentifier: string;
  keywords: string[];
  spatialReferences: SpatialReference[];
  spatialSystems: KeyValue[];
}

interface KeyValue {
  key: string;
  value?: string;
}

interface SpatialReference {
  name: string;
  type: string;
  latitude1: number;
  latitude2: number;
  longitude1: number;
  longitude2: number;
}

export interface Address {
  exists: boolean;
  uuid: string;
  _state: DocumentState;
  firstName?: string;
  lastName?: string;
  email?: string;
  organization?: string;
  street?: string;
  city?: string;
  postcode?: string;
  country?: KeyValue;
  state?: KeyValue;
  phone?: string;
  postCode?: string;
}

export interface Url {
  url?: string;
  type?: KeyValue;
  title?: string;
  explanation?: string;
}

export interface Operation {
  name?: KeyValue;
  addressList?: string[];
  platform?: number[];
  methodCall?: string;
}

export interface TimeReference {
  type: number;
  date: string;
  from: string;
  to: string;
}

interface Conformity {
  level: number;
  specification: string;
}

export interface Location {
  latitude1?: number;
  longitude1?: number;
  latitude2?: number;
  longitude2?: number;
  name?: string;
  type?: string;
}
