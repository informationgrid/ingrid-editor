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
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../../../services/config/config.service";
import {
  DocumentService,
  SaveOptions,
} from "../../../../services/document/document.service";
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
  TimeReference,
  Url,
} from "./get-capabilities.model";
import { CodelistQuery } from "../../../../store/codelist/codelist.query";
import { isEmptyObject } from "../../../../shared/utils";
import { CodelistEntry } from "../../../../store/codelist/codelist.model";
import { lastValueFrom } from "rxjs";
import { KeywordAnalysis } from "../../../../../profiles/ingrid/utils/keywords";

@Injectable({
  providedIn: "root",
})
export class GetCapabilitiesService {
  private backendUrl: string;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
    private documentService: DocumentService,
    private codelistQuery: CodelistQuery,
    private keywordAnalysis: KeywordAnalysis,
  ) {
    configService.$userInfo.subscribe(
      () => (this.backendUrl = configService.getConfiguration().backendUrl),
    );
  }

  analyze(url: string) {
    return this.http.post<GetCapabilitiesAnalysis>(
      this.backendUrl + "getCapabilities/analyzeGetCapabilities",
      url,
    );
  }

  async applyChangesToModel(
    model: any,
    values: GetCapabilitiesAnalysis,
    parentFolder: number,
  ) {
    const urlReferences: Url[] = [];
    for (const [key, value] of Object.entries(values)) {
      if (key === "title") model.title = value;
      if (key === "description") model.description = value;
      if (key === "versions") model.service.version = value;
      if (key === "fees") model.resource.useConstraints = [{ title: value }];
      if (key === "accessConstraints") model.resource.accessConstraints = value;
      if (key === "onlineResources") urlReferences.push(...value);
      if (key === "dataServiceType") model.service.type = { key: value };
      if (key === "keywords") {
        await this.addKeywordsToModel(value, model);
      }
      if (key === "address")
        model.pointOfContact = await this.handleAddress(
          value,
          values.addressParent,
        );
      if (key === "boundingBoxes")
        model.spatial.references = this.mapBoundingBox(value);
      if (key === "conformities")
        model.conformanceResult = this.mapConformities(value);
      if (key === "coupledResources") {
        model.service.coupledResources = await this.handleCoupledResources(
          value,
          parentFolder,
        );
        if (value?.length > 0) {
          model.service.couplingType = {
            key: "tight",
          };
        }
      }
      if (key === "operations")
        model.service.operations = this.mapOperations(value);
      if (key === "resourceLocators") urlReferences.push(...value);
      if (key === "serviceType") {
        model.service.classification = this.mapClassification(value);
        if (value === "WCS") model.service.explanation = "WCS Service";
      }

      if (key === "timeReference")
        model.temporal.events = this.mapEvents(value);
      if (key === "timeSpan")
        model.temporal = {
          ...model.temporal,
          ...this.mapTimeSpan(value),
        };
      if (key === "spatialReferenceSystems")
        model.spatial.spatialSystems = this.mapSpatialReferenceSystems(value);
    }

    if (urlReferences.length > 0) {
      model.references = urlReferences;
    }

    this.handleDefaultTemporalEvent(model);
  }

  private async addKeywordsToModel(value: string[], model: any) {
    const response = await this.keywordAnalysis.analyzeKeywords(value, false);
    response.forEach((item) => {
      switch (item.thesaurus) {
        case "INSPIRE-Themen":
          model.themes.push(item.value);
          break;
        case "Gemet Schlagworte":
          model.keywords.gemet.push(item.value);
          break;
        case "Umthes Schlagworte":
          model.keywords.umthes.push(item.value);
          break;
        case "Freie Schlagworte":
          model.keywords.free.push(item.value);
          break;
      }
    });
  }

  private handleDefaultTemporalEvent(model: any) {
    const currentDateEvent = {
      referenceDate: new Date(),
      referenceDateType: { key: "1" },
    };
    if (model.temporal.events.length === 0) {
      model.temporal.events.push(currentDateEvent);
    } else if (isEmptyObject(model.temporal.events[0])) {
      model.temporal.events[0] = currentDateEvent;
    }
  }

  private mapBoundingBox(bboxes: Location[]): any {
    return bboxes.map((box) => {
      return box.latitude1 === null
        ? {
            type: "free",
            title: box.name,
            value: null,
          }
        : {
            type: "free",
            title: box.name,
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
        name: op.name.key
          ? { key: op.name.key }
          : { key: null, value: op.name.value },
        methodCall: op.addressList[0],
      };
    });
  }

  private mapSpatialReferenceSystems(value: any) {
    return value.map((item: any) => {
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
        referenceDateType: { key: item.type + "" },
      };
    });
  }

  private mapConformities(value: any[]) {
    return value.map((item) => {
      const entry: CodelistEntry = this.codelistQuery.getCodelistEntryByValue(
        "6005",
        item.specification,
        "iso",
      );
      const spec = entry
        ? { key: entry.id }
        : { key: null, value: item.specification };
      return {
        pass: { key: `${item.level}` },
        specification: spec,
        publicationDate: this.getPublicationDate(entry, item),
        isInspire: entry !== null && entry !== undefined,
      };
    });
  }

  private async handleCoupledResources(
    resources: CoupledResource[],
    parent: number,
  ): Promise<DocumentReference[]> {
    const res = resources.map(async (resource) => {
      let uuid = resource.uuid;
      if (!resource.exists) {
        const doc = await this.mapCoupledResource(resource);
        const savedDoc = this.documentService.save(
          SaveOptions.createNewDocument(
            doc as any, // TODO AW: we should save a document without metadata, so cleanup IgeDocument
            "InGridGeoDataset",
            parent,
            null,
            null,
            true,
            uuid,
          ),
        );
        const newDoc = await lastValueFrom(savedDoc);
        return <DocumentReference>{
          ...docReferenceTemplate,
          uuid: newDoc.metadata.uuid,
        };
      }
      return <DocumentReference>{
        ...docReferenceTemplate,
        uuid: uuid,
      };
    });
    return await Promise.all(res);
  }

  private async mapCoupledResource(
    resource: CoupledResource,
  ): Promise<Partial<IgeDocument>> {
    const doc = {
      title: resource.title,
      description: resource.description,
      identifier: resource.objectIdentifier,
      keywords: {
        gemet: [],
        umthes: [],
        free: [],
      },
      themes: [],
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
    await this.addKeywordsToModel(resource.keywords, doc);
    return doc;
  }

  private async handleAddress(value: Address, addressParent: number) {
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

    const state =
      !value.state?.key && !value.state?.value
        ? null
        : {
            key: value.state.key,
            value: value.state.value,
          };
    const country = !value.country?.key ? null : { key: value.country.key };

    const address: any = {
      firstName: value.firstName,
      lastName: value.lastName,
      organization: value.organization,
      publishArea: {
        key: "1",
      },
      contact: contact,
      address: {
        street: value.street,
        "zip-code": value.postcode,
        city: value.city,
        administrativeArea: state,
        country: country,
      },
    };

    if (value.exists) {
      return [{ ref: value.uuid, type: { key: "1" } }];
    }

    const result = this.documentService.save(
      SaveOptions.createNewDocument(
        address,
        type,
        addressParent,
        true,
        null,
        true,
        value.uuid,
      ),
    );
    const newAddress = await lastValueFrom(result);
    return [{ ref: newAddress.metadata.uuid, type: { key: "1" } }];
  }

  private mapTimeSpan(value: TimeReference): any {
    const template: any = {
      resourceDateType: {
        key: null,
      },
      resourceRange: {
        start: null,
        end: null,
      },
    };

    if (value.from && value.to) {
      template.resourceRange.start = value.from;
      template.resourceRange.end = value.to;
      template.resourceDateType.key = "since";
      template.resourceDateTypeSince = {
        key: "exactDate",
      };
    } else if (value.to) {
      template.resourceDate = value.from;
      template.resourceDateType.key = "since";
    } else if (value.from) {
      template.resourceDate = value.from;
      template.resourceDateType.key = "till";
    }

    return template;
  }

  private getPublicationDate(entry: CodelistEntry, item: any) {
    if (!entry) {
      if (item.publishDate) return item.publishDate;
      return null;
    }

    const dateParts = entry.data.split("-");
    return new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2]);
  }
}
