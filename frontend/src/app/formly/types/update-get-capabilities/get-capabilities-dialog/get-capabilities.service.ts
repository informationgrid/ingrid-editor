import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../../../services/config/config.service";
import { DocumentService } from "../../../../services/document/document.service";
import { IgeDocument } from "../../../../models/ige-document";
import {
  docReferenceTemplate,
  DocumentReference,
} from "../../document-reference-type/document-reference-type.component";
import {
  Address,
  CoupledResource,
  GetCapabilitiesAnalysis,
  Location,
  Operation,
} from "./get-capabilities.model";

@Injectable({
  providedIn: "root",
})
export class GetCapabilitiesService {
  private backendUrl: string;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
    private documentService: DocumentService
  ) {
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

  async applyChangesToModel(model: any, values: GetCapabilitiesAnalysis) {
    for (const [key, value] of Object.entries(values)) {
      if (key === "title") model.title = value;
      if (key === "description") model.description = value;
      if (key === "versions") model.service.version = value;
      if (key === "fees") model.resource.useConstraints = [{ title: value }];
      if (key === "accessConstraints") model.resource.accessConstraints = value;
      if (key === "onlineResources") model.references = value;
      if (key === "dataServiceType") model.service.type = { key: value };
      if (key === "keywords") model.keywords = value;
      if (key === "address")
        model.pointOfContact = await this.handleAddress(value);
      if (key === "boundingBoxes")
        model.spatial.references = this.mapBoundingBox(value);
      if (key === "conformities")
        model.conformanceResult = this.mapConformities(value);
      if (key === "coupledResources")
        model.service.coupledResources = await this.handleCoupledResources(
          value
        );
      if (key === "operations")
        model.service.operations = this.mapOperations(value);
      if (key === "resourceLocators") null;
      if (key === "serviceType")
        model.service.classification = this.mapClassification(value);
      if (key === "timeReference")
        model.temporal.events = this.mapEvents(value);
      if (key === "timeSpans") null;
      if (key === "spatialReferenceSystems")
        model.spatial.spatialSystems = this.mapSpatialReferenceSystems(value);
    }
  }

  private mapBoundingBox(bboxes: Location[]): any {
    return bboxes.map((box) => {
      return {
        type: "free",
        value: {
          lat1: box.latitude1,
          lon1: box.longitude1,
          lat2: box.latitude2,
          lon2: box.longitude2,
        },
      };
    });
  }

  private mapOperations(operations: Operation[]) {
    return operations.map((op) => {
      return {
        name: 1,
        methodCall: op.addressList[0],
      };
    });
  }

  private mapSpatialReferenceSystems(value: any) {
    return value.map((item) => {
      return item.key !== null ? { key: item.key } : item;
    });
  }

  private mapClassification(value: any) {
    switch (value) {
      case "CSW":
        return [{ key: "207" }];
      case "WMS":
        return [{ key: "202" }];
      case "WFS":
        return [{ key: "201" }];
      case "WCS":
        return [{ key: "203" }];
      case "WCTS":
        return [];
    }
  }

  private mapEvents(value: any[]) {
    return value.map((item) => {
      return {
        referenceDate: item.date,
        referenceDateType: { key: item.type },
      };
    });
  }

  private mapConformities(value: any[]) {
    return value.map((item) => {
      return {
        pass: { key: item.level },
        specification: {
          key: null,
          value: item.specification,
        },
      };
    });
  }

  private async handleCoupledResources(
    resources: CoupledResource[]
  ): Promise<DocumentReference[]> {
    const res = resources.map(async (resource) => {
      let uuid = resource.uuid;
      if (!resource.exists) {
        const doc = this.mapCoupledResource(resource);
        const savedDoc = await this.documentService
          .save(doc, true, false, null, true, false)
          .toPromise();
        return <DocumentReference>{
          ...docReferenceTemplate,
          title: resource.title,
          uuid: savedDoc._uuid,
        };
      }
      return <DocumentReference>{
        ...docReferenceTemplate,
        title: resource.title,
        uuid: uuid,
      };
    });
    return await Promise.all(res);
  }

  private mapCoupledResource(resource: CoupledResource): IgeDocument {
    return {
      _uuid: resource.uuid,
      _type: "InGridGeoDataset",
      _parent: null,
      title: resource.title,
      description: resource.description,
      identifier: resource.objectIdentifier,
      keywords: resource.keywords,
      spatial: {
        references: resource.spatialReferences.map((item) => {
          return {
            type: "free",
            title: item.name,
            value: {
              lat1: item.latitude1,
              lat2: item.latitude2,
              lon1: item.longitude1,
              lon2: item.longitude2,
            },
          };
        }),
        spatialSystems: resource.spatialSystems.map((item) => {
          if (item.key === null) return item;
          else return { key: item.key };
        }),
      },
    };
  }

  private async handleAddress(value: Address) {
    const type =
      value.firstName || value.lastName
        ? "InGridPersonDoc"
        : "InGridOrganisationDoc";

    const contact = [];
    if (value.email)
      contact.push({
        type: {
          key: "3",
        },
        connection: value.email,
      });

    if (value.phone)
      contact.push({
        type: {
          key: "1",
        },
        connection: value.phone,
      });

    const address: IgeDocument = {
      _uuid: value.uuid,
      _type: type,
      _parent: null,
      _state: value._state,
      firstName: value.firstName,
      lastName: value.lastName,
      publishArea: {
        key: "1",
      },
      contact: contact,
      address: {
        street: value.street,
        "zip-code": value.postcode,
        city: value.city,
        administrativeArea: {
          key: value.state.key,
        },
        country: {
          key: value.country.key,
        },
      },
    };

    if (value.exists) {
      return [{ ref: address, type: { key: "1" } }];
    }

    const result = await this.documentService
      .save(address, true, true, null, true, false)
      .toPromise();
    return [{ ref: result, type: { key: "1" } }];
  }
}
