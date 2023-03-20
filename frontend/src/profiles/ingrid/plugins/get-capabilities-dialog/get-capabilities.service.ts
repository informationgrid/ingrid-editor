import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../../../app/services/config/config.service";

export interface GetCapabilitiesAnalysis {
  title: string;
  description: string;
  versions: string[];
  fees: string;
  accessConstraints: string[];
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

interface SpatialReference {
  name: string;
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
  relationType?: number;
  relationTypeName?: string;
  datatype?: string;
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
}
