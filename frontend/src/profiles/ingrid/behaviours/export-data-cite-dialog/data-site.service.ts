import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { IgeError } from "../../../../app/models/ige-error";
import { DocumentService } from "../../../../app/services/document/document.service";
import { firstValueFrom } from "rxjs";
import { Metadata } from "../../../../app/models/ige-document";

@Injectable({
  providedIn: "root",
})
export class DataSiteService {
  private http = inject(HttpClient);
  private documentService = inject(DocumentService);

  async createDataCite(model: any, metadata: Metadata): Promise<any> {
    return {
      doi: model.publication.doi,
      event: "publish",
      creators: [await this.getCreator(model.pointOfContact)],
      alternateIdentifiers: [
        {
          alternateIdentifierType: "UUID",
          alternateIdentifier: metadata.uuid,
        },
      ],
      language: "de",
      publisher: {
        name: "DataCite",
        publisherIdentifier: "https://ror.org/04wxnsj81",
        publisherIdentifierScheme: "ROR",
        schemeUri: "https://ror.org/",
      },
      publicationYear: 2014,
      contributors: [
        {
          name: "Starr, Joan",
          nameType: "Personal",
          givenName: "Joan",
          familyName: "Starr",
          affiliation: [
            {
              affiliationIdentifier: "https://ror.org/03yrm5c26",
              affiliationIdentifierScheme: "ROR",
              name: "California Digital Library",
              schemeUri: "https://ror.org/",
            },
          ],
          contributorType: "ProjectLeader",
          nameIdentifiers: [
            {
              schemeUri: "https://orcid.org",
              nameIdentifier: "https://orcid.org/0000-0002-7285-027X",
              nameIdentifierScheme: "ORCID",
            },
          ],
        },
      ],
      dates: [
        {
          date: "2021-01-26",
          dateType: "Updated",
          dateInformation: "Updated with 4.4 properties",
        },
        {
          date: "2014",
          dateType: "Issued",
          dateInformation: null,
        },
      ],
      types: {
        schemaOrg: "ScholarlyArticle",
        citeproc: "article-journal",
        bibtex: "article",
        ris: "RPRT",
        resourceTypeGeneral: "Text",
      },
      titles: [
        {
          lang: "de",
          title: model.title,
        },
      ],
      descriptions: [
        {
          lang: "en-US",
          description:
            "XML example of all DataCite Metadata Schema v4.4 properties.",
          descriptionType: "Abstract",
        },
      ],
      rightsList: [
        {
          rights: "Creative Commons Zero v1.0 Universal",
          rightsUri:
            "https://creativecommons.org/publicdomain/zero/1.0/legalcode",
          schemeUri: "https://spdx.org/licenses/",
          rightsIdentifier: "cc0-1.0",
          rightsIdentifierScheme: "SPDX",
        },
      ],
      geoLocations: [
        {
          geoLocationBox: {
            eastBoundLongitude: -68.211,
            northBoundLatitude: 42.893,
            southBoundLatitude: 41.09,
            westBoundLongitude: -71.032,
          },
          geoLocationPlace: "Atlantic Ocean",
        },
      ],
    };
  }

  uploadDOI(username: string, password: string, attributes: any) {
    let headers: any = {
      "Content-Type": "application/vnd.api+json",
      Authorization: "Basic " + btoa(username + ":" + password),
    };

    return this.http.post<any>(
      `https://api.test.datacite.org/dois`,
      {
        data: {
          type: "dois",
          attributes: attributes,
        },
      },
      { headers },
    );
  }

  private async getCreator(contacts: any[]): Promise<any> {
    const creator = contacts.find((contact) => contact.type.key === "11");
    if (!creator) throw new IgeError("No creator found");
    const address = await firstValueFrom(
      this.documentService.load(creator.ref, true, false, true),
    );
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
}
