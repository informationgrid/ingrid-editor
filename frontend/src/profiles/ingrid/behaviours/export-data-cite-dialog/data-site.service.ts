/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
import { inject, Injectable } from "@angular/core";
import { DocumentService } from "../../../../app/services/document/document.service";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom, Observable, of } from "rxjs";
import {
  DocumentWithMetadata,
  Metadata,
} from "../../../../app/models/ige-document";
import { GeneralStore } from "../../../../app/store/general.store";
import { CodelistStore } from "../../../../app/store/codelist/codelist.store";
import { BehaviourService } from "../../../../app/services/behavior/behaviour.service";
import { catchError, map, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DataSiteService {
  private http = inject(HttpClient);
  private documentService = inject(DocumentService);
  private generalStore = inject(GeneralStore);
  private codelistStore = inject(CodelistStore);
  private behaviourService = inject(BehaviourService);

  doiExists(doi: string, authHeader: any = {}): Observable<boolean> {
    const dataciteURL =
      this.behaviourService.getBehaviour("plugin.ingrid.doi").data.dataCiteURL;
    return this.http
      .get<any>(`${dataciteURL}/dois/${doi}`, { headers: authHeader })
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

  async createDataCite(model: any, metadata: Metadata): Promise<any> {
    const generalResourceType = model.publication.generalResourceType;
    const resourceType = model.publication.resourceType;
    if (!generalResourceType) throw new Error("No resource type found");

    const portalURL =
      this.behaviourService.getBehaviour("plugin.ingrid.doi").data
        .dataCiteDetailURL;
    try {
      return {
        // event: "publish", // do not publish since dataset cannot be removed from datacite anymore
        doi: model.publication.doi,
        creators: [await this.getCreator(model.pointOfContact)],
        alternateIdentifiers: [
          {
            alternateIdentifierType: "UUID",
            alternateIdentifier: metadata.uuid,
          },
        ],
        language: this.generalStore.catalogLanguage(),
        publisher: await this.getPublisher(model),
        publicationYear: this.getPublicationYear(model),
        contributors: await this.getContributors(model),
        dates: this.getDates(model),
        types: {
          resourceTypeGeneral: this.codelistStore.getCodelistEntryByKey(
            "3390",
            generalResourceType.key,
          ).fields.de,
          resourceType: resourceType?.key
            ? this.codelistStore.getCodelistEntryByKey("3386", resourceType.key)
                .fields.de
            : undefined,
        },
        titles: this.getTitles(model),
        descriptions: [
          {
            lang: this.generalStore.catalogLanguage(),
            description: model.description,
            descriptionType: "Abstract",
          },
        ],
        rightsList: this.getRightsList(model),
        geoLocations: this.getGeoLocations(model),
        url: `${portalURL}${metadata.uuid}`,
      };
    } catch (error) {
      console.error("Failed to generate DataCite metadata:", error);
      throw error;
    }
  }

  uploadDOI(
    username: string,
    password: string,
    attributes: any,
  ): Observable<any> {
    const dataciteURL =
      this.behaviourService.getBehaviour("plugin.ingrid.doi").data.dataCiteURL;
    let headers: any = {
      "Content-Type": "application/vnd.api+json",
      Authorization: "Basic " + btoa(username + ":" + password),
    };
    const body = {
      data: {
        type: "dois",
        attributes: attributes,
      },
    };

    return this.doiExists(attributes.doi, headers).pipe(
      switchMap((exists) => {
        if (exists) {
          return this.http.put<any>(
            `${dataciteURL}/dois/${attributes.doi}`,
            body,
            {
              headers,
            },
          );
        } else {
          return this.http.post<any>(`${dataciteURL}/dois`, body, { headers });
        }
      }),
    );
  }

  private async getCreator(contacts: any[]): Promise<any> {
    const creator = contacts?.find((contact) => contact.type.key === "11");
    if (!creator) throw new Error("No creator found");
    const address = await firstValueFrom(
      this.documentService.load(creator.ref, true, false, true),
    );
    return this.mapToAddress(address);
  }

  private mapToAddress(address: DocumentWithMetadata) {
    if (address.metadata.docType === "InGridOrganisationDoc") {
      return {
        name: address.document.organization,
        nameType: "Organizational",
      };
    } else {
      return {
        name: `${address.document.lastName}, ${address.document.firstName}`,
        nameType: "Personal",
        givenName: address.document.firstName,
        familyName: address.document.lastName,
      };
    }
  }

  private getPublicationYear(model: any): number {
    const createdDate = model.temporal?.event?.created;
    if (!createdDate) throw new Error("No created date found");
    return parseInt(createdDate.substring(0, 4));
  }

  private async getPublisher(model: any) {
    const publisher = model.pointOfContact?.find(
      (contact: any) => contact.type.key === "10",
    );
    if (!publisher) throw new Error("No publisher found");

    const address = await firstValueFrom(
      this.documentService.load(publisher.ref, true, false, true),
    );

    if (address.document.organization === "Bundesanstalt für Wasserbau") {
      return {
        name: address.document.organization,
        publisherIdentifier: "https://ror.org/03z6hnk02",
        publisherIdentifierScheme: "ROR",
        schemeUri: "https://ror.org/",
      };
    } else {
      return (
        address.document.organization ??
        `${address.document.lastName}, ${address.document.firstName}`
      );
    }
  }

  private async getContributors(model: any) {
    const contributors = model.pointOfContact?.filter(
      (contact: any) => contact.type.key !== "10" && contact.type.key !== "11",
    );
    const result = [];
    for (const contributor of contributors) {
      const address = await firstValueFrom(
        this.documentService.load(contributor.ref, true, false, true),
      );

      result.push({
        ...this.mapToAddress(address),
        contributorType: "Other",
      });
    }
    return result;
  }

  private getDates(model: any): any[] {
    const events = [];
    const eventModel = model.temporal?.event;
    if (eventModel?.created)
      events.push({ date: eventModel.created, dateType: "Created" });
    if (eventModel?.firstPublished)
      events.push({ date: eventModel.firstPublished, dateType: "Issued" });
    if (eventModel?.lastModified)
      events.push({ date: eventModel.lastModified, dateType: "Updated" });
    return events;
  }

  private getTitles(model: any): any[] {
    const result = [
      {
        lang: this.generalStore.catalogLanguage(),
        title: model.title,
      },
    ];
    if (model.alternateTitle) {
      result.push({
        lang: this.generalStore.catalogLanguage(),
        title: model.alternateTitle,
      });
    }
    return result;
  }

  private getRightsList(model: any): any[] {
    return (
      model.resource.useConstraints?.map((useConstraint: any) => {
        const licenseKey = useConstraint.title?.key;
        if (!licenseKey) throw new Error("Missing use-constraint license");
        const constraintEntry = this.codelistStore.getCodelistEntryByKey(
          "6500",
          licenseKey,
        );
        let licenseData = this.getLicenseData(useConstraint);

        const spdxLicenceUrl = this.mapToSpdxLicenceUrl(constraintEntry);
        if (spdxLicenceUrl.ident === null)
          return {
            rights: constraintEntry.fields.de,
          };
        return {
          rights: spdxLicenceUrl.name,
          rightsUri: licenseData.url,
          schemeUri: "https://spdx.org/licenses/",
          rightsIdentifier: spdxLicenceUrl.ident,
          rightsIdentifierScheme: "SPDX",
        };
      }) ?? []
    );
  }

  private getLicenseData(useConstraint: any) {
    try {
      return useConstraint.data ? JSON.parse(useConstraint.data) : {};
    } catch (error) {
      console.warn("Failed to parse license data:", error);
      return {};
    }
  }

  private mapToSpdxLicenceUrl(entry: any): { name: string; ident: string } {
    if (!entry) return null;

    switch (entry.id) {
      case "1":
        return {
          name: "Data licence Germany – attribution – version 2.0",
          ident: "DL-DE-BY-2.0",
        };
      case "8":
        return {
          name: "Open Data Commons Attribution License v1.0",
          ident: "ODC-By-1.0",
        };
      case "12":
        return {
          name: "Creative Commons Attribution No Derivatives 3.0 Unported",
          ident: "CC-BY-ND-3.0",
        };
      case "23":
        return { name: "Mozilla Public License 2.0", ident: "MPL-2.0" };
      case "25":
        return {
          name: "Data licence Germany – zero – version 2.0",
          ident: "DL-DE-ZERO-2.0",
        };
      case "27":
        return {
          name: "Creative Commons Attribution 4.0 International",
          ident: "CC-BY-4.0",
        };
      case "28":
        return {
          name: "Creative Commons Attribution Non Commercial 4.0 International",
          ident: "CC-BY-NC-4.0",
        };
      case "29":
        return {
          name: "Creative Commons Attribution No Derivatives 4.0 International",
          ident: "CC-BY-ND-4.0",
        };
      case "30":
        return {
          name: "Creative Commons Attribution Share Alike 4.0 International",
          ident: "CC-BY-SA-4.0",
        };
      case "31":
        return {
          name: "Creative Commons Public Domain Mark 1.0 Universal",
          ident: "CC-PDM-1.0",
        };
      case "34":
        return {
          name: "Creative Commons Attribution Non Commercial Share Alike 4.0 International",
          ident: "CC-BY-NC-SA-4.0",
        };
      case "35":
        return {
          name: "Creative Commons Attribution Non Commercial No Derivatives 4.0 International",
          ident: "CC-BY-NC-ND-4.0",
        };
      case "37":
        return {
          name: "Creative Commons Attribution 3.0 Germany",
          ident: "CC-BY-3.0-DE",
        };
      default:
        console.warn(
          "License could not be mapped: " + entry.id + " - " + entry.fields.de,
        );
        return { name: entry.fields.de, ident: null };
    }
  }

  private getGeoLocations(model: any): any[] {
    return (
      model.spatial?.references?.map((spatial: any) => {
        return {
          geoLocationBox: {
            eastBoundLongitude: spatial.value.lon1,
            northBoundLatitude: spatial.value.lat1,
            southBoundLatitude: spatial.value.lat2,
            westBoundLongitude: spatial.value.lon2,
          },
          geoLocationPlace: spatial.title,
        };
      }) ?? []
    );
  }
}
