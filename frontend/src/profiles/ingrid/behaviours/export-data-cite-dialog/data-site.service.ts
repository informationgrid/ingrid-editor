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
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DataSiteService {
  private http = inject(HttpClient);
  private documentService = inject(DocumentService);
  private generalStore = inject(GeneralStore);
  private codelistStore = inject(CodelistStore);
  private behaviourService = inject(BehaviourService);

  doiExists(doi: string): Observable<boolean> {
    const dataciteURL =
      this.behaviourService.getBehaviour("plugin.ingrid.doi").data.dataCiteURL;
    return this.http.get<any>(`${dataciteURL}/dois/${doi}`).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  async createDataCite(model: any, metadata: Metadata): Promise<any> {
    const generalResourceType = model.publication.generalResourceType;
    if (!generalResourceType) throw new Error("No resource type found");

    // event: "publish",
    const portalURL =
      this.behaviourService.getBehaviour("plugin.ingrid.doi").data
        .dataCiteDetailURL;
    return {
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
  }

  uploadDOI(
    username: string,
    password: string,
    attributes: any,
    create: boolean,
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

    if (create) {
      return this.http.put<any>(`${dataciteURL}/dois/${attributes.doi}`, body, {
        headers,
      });
    } else {
      return this.http.post<any>(`${dataciteURL}/dois`, body, { headers });
    }
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

    return (
      address.document.organization ??
      `${address.document.lastName}, ${address.document.firstName}`
    );
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
        const constraintEntry = this.codelistStore.getCodelistEntryByKey(
          "6500",
          useConstraint.title.key,
        );
        return {
          rights: "Creative Commons Attribution 4.0 International",
        };
      }) ?? []
    );
  }

  private mapToSpdxLicenceUrl(data: any): string {
    if (!data) return "";

    const entry = JSON.parse(data);
    const id = entry.id;
    if (id === "odby") {
      return "https://opendatacommons.org/licenses/by/1.0/";
    } else if (id === "cc-by-nd/3.0") {
      return "https://creativecommons.org/licenses/by/3.0/legalcode";
    } else if (id === "cc-by/4.0") {
      return "https://creativecommons.org/licenses/by/4.0/legalcode";
    } else if (id === "cc-by-nc/4.0") {
      return "https://creativecommons.org/licenses/by-nc/4.0/legalcode";
    } else if (id === "cc-by-nd/4.0") {
      return "https://creativecommons.org/licenses/by-nd/4.0/legalcode";
    } else if (id === "cc-by-sa/4.0") {
      return "https://creativecommons.org/licenses/by-sa/4.0/legalcode";
    } else if (id === "mozilla") {
      return "https://opensource.org/licenses/MPL/2.0/";
    } else {
      return "";
    }
  }

  private getGeoLocations(model: any): any[] {
    return model.spatial?.references?.map((spatial: any) => {
      return {
        geoLocationBox: {
          eastBoundLongitude: spatial.value.lon1,
          northBoundLatitude: spatial.value.lat1,
          southBoundLatitude: spatial.value.lat2,
          westBoundLongitude: spatial.value.lon2,
        },
        geoLocationPlace: spatial.title,
      };
    });
  }
}
