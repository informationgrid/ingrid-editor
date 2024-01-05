/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
