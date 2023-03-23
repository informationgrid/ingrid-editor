import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../../../services/config/config.service";

export interface GetCapabilitiesAnalysis {
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
  spatialReferenceSystems: SpatialReference[];
  address: Address;
  operations: Operation[];
  resourceLocators: Url[];
  timeReference: TimeReference[];
  timeSpans: TimeReference[];
  conformities: Conformity[];
  coupledResources: any[];
}

interface KeyValue {
  key: string;
  value?: string;
}

interface SpatialReference {
  key: string;
  value: string;
}
interface Address {
  firstName?: string;
  lastName?: string;
  email?: string;
  organization?: string;
  street?: string;
  city?: string;
  postcode?: string;
  country?: string;
  state?: string;
  phone?: string;
  postCode?: string;
}
interface Url {
  url?: string;
  type?: KeyValue;
  title?: string;
  explanation?: string;
}
interface Operation {
  name?: string;
  addressList?: string[];
  platform?: number[];
  methodCall?: string;
}
interface TimeReference {}
interface Conformity {}
interface Location {
  latitude1?: number;
  longitude1?: number;
  latitude2?: number;
  longitude2?: number;
  name?: string;
  type?: string;
}

@Injectable({
  providedIn: "root",
})
export class GetCapabilitiesService {
  private backendUrl: string;
  constructor(private http: HttpClient, configService: ConfigService) {
    configService.$userInfo.subscribe(
      () => (this.backendUrl = configService.getConfiguration().backendUrl)
    );
  }

  analyze(url: string) {
    return this.http.post<GetCapabilitiesAnalysis>(
      this.backendUrl + "getCapabilities/analyzeGetCapabilities",
      url
    );
  }

  applyChangesToModel(model: any, values: GetCapabilitiesAnalysis) {
    Object.entries(values).forEach(([key, value]) => {
      if (key === "title") model.title = value;
      if (key === "description") model.description = value;
      if (key === "versions") model.service.version = value;
      if (key === "fees") model.resource.useConstraints = [{ title: value }];
      if (key === "accessConstraints") model.resource.accessConstraints = value;
      if (key === "onlineResources") model.references = value;
      if (key === "dataServiceType") model.service.type = { key: value };
      if (key === "keywords") model.keywords = value;
      if (key === "spatialReferenceSystems")
        model.spatial.spatialSystems = value.map((item) => {
          return item.key !== null ? { key: item.key } : item;
        });
      // if (key === "description") model.description = value;
      // if (key === "fees") model.resource.useConstraints = [{ title: value }];
    });
  }
}
