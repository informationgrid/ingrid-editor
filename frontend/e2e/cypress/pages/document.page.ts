import { BasePage } from './base.page';
import { Tree } from './tree.partial';

export const SEPARATOR = 'chevron_right';
export const ROOT = `Daten`;

export class DocumentPage extends BasePage {
  static CreateDialog = class {
    static open() {
      cy.get(DocumentPage.Toolbar.NewDoc).click();
    }

    static checkPath(path: string[]) {
      cy.get('mat-dialog-container ige-breadcrumb').should('have.text', path.join(SEPARATOR));
    }

    static setLocation(nodeTitle: string) {
      Tree.openNode([nodeTitle], true);
      cy.get('[data-cy=create-applyLocation]').click();
    }

    static changeLocation(nodeTitle: string) {
      cy.get('[data-cy=create-changeLocation]').click();
      this.setLocation(nodeTitle);
    }

    static execute() {
      cy.get('[data-cy=create-action]').click();
    }

    static cancel() {
      cy.get('[data-cy=dlg-close]').click();
      // cy.get('.dialog-title-wrapper button').click();
    }
  };

  static treeSearchBar = '[placeholder=Suchen]';

  static title = '.form-info-bar .title .label';

  static Toolbar: Record<string, string> = {
    NewDoc: '[data-cy=toolbar_NEW_DOC]',
    NewFolder: '[data-cy=toolbar_CREATE_FOLDER]',
    // Preview: '[data-cy=toolbar_PRINT]',
    Copy: '[data-cy=toolbar_COPY]',
    // Revert: '[data-cy=toolbar_REVERT]',
    Delete: '[data-cy=toolbar_DELETE]',
    Previous: '[data-cy=toolbar_HISTORY_PREVIOUS]',
    Next: '[data-cy=toolbar_HISTORY_NEXT]',
    Save: '[data-cy=toolbar_SAVE]',
    Publish: '[data-cy=toolbar_PUBLISH]'
    // JSON: '[data-cy=toolbar_SHOW_JSON]'
  };

  static AddAddressDialog = class {
    static search(searchString: string) {
      cy.get('[data-cy="choose-address-tree"]').findByPlaceholderText('Suchen').click();
      cy.get('[data-cy="choose-address-tree"]').findByPlaceholderText('Suchen').type(searchString);
    }

    static searchAndSelect(searchString: string, addressType: string) {
      // TODO replace addressType with proper addressType class or enum
      this.search(searchString);
      cy.wait(500);
      cy.get('ige-document-list-item').contains(searchString).click();
    }
  };

  static visit() {
    cy.intercept('GET', '/api/tree/children').as('treeCall');
    cy.visit('form');
    cy.wait('@treeCall');
  }

  static visitSingleDoc() {
    cy.visit('form;id=7e9687e8-43f4-4b95-bdcb-27647197a8cb');
  }

  static createDocument(docName: string) {
    cy.log('Create Document: ' + docName);
    cy.get(DocumentPage.Toolbar.NewDoc, { timeout: 18000 }).click();
    this.fillDialog(docName);
  }

  static createFolder(folderName: string, location?: string[]) {
    cy.log('Create folder: ' + folderName);
    cy.get(DocumentPage.Toolbar.NewFolder).click();
    if (location) {
      this.changeLocation(location);
    }
    this.fillDialog(folderName);
  }

  private static fillDialog(title: string) {
    let beforeLength = 0;
    Tree.getNumberOfNodes().then(length => {
      beforeLength = length;
      cy.log('nodes count before: ' + length);
      this.fillCreateDialog(title);
      cy.get('mat-tree mat-tree-node').should('have.length.at.least', beforeLength + 1);
    });
  }

  static CreateFullMcloudDocumentWithAPI(
    title: string,
    published?: boolean,
    parentNode = 'a0df9837-512a-4594-b2ef-2814f7c55c81'
  ) {
    const json = {
      _hasChildren: false,
      _parent: parentNode,
      _type: 'mCloudDoc',
      title: title,
      _state: 'W',
      _version: 1,
      description: 'Beschreibung',
      addresses: [
        {
          type: '10',
          ref: '214ca5bf-da1b-4003-b7b6-e73a2ef0ec10'
        }
      ],
      usage: 'Nutzungshinweise',
      mCloudCategories: ['roads'],
      openDataCategories: ['TRAN'],
      downloads: [{ link: { value: 'link.link', asLink: true }, type: 'linktyp' }],
      license: 'Andere offene Lizenz',
      origin: 'Vermerk',
      mfundProject: 'Projekt',
      mfundFKZ: 'FKZ',
      geoReferenceVisual: [
        {
          value: {
            lat1: 53.01147838269375,
            lon1: 8.481445312500002,
            lat2: 53.608803292930894,
            lon2: 8.989562988281252
          },
          title: 'Bremen, Germany',
          type: 'free'
        }
      ],
      events: [{ text: '1', date: '2020-10-25T23:00:00.000Z' }],
      timeSpan: {
        rangeType: 'range',
        timeSpanRange: {
          start: '2020-04-30T22:00:00.000Z',
          end: '2020-10-30T23:00:00.000Z'
        }
      },
      periodicity: '8'
    };

    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: `${Cypress.config('baseUrl')}/api/datasets?address=false&publish=${published}`,
        body: json,
        method: 'POST',
        auth: {
          bearer: tokens.access_token
        }
      });
    });
  }

  static CreateTestDocumentWithAPI(title: string, published?: boolean) {
    const json = {
      _hasChildren: false,
      _parent: 'a0df9837-512a-4594-b2ef-2814f7c55c81',
      _type: 'TestDoc',
      title: title,
      _state: 'W',
      _version: 1,
      text: 'Textfeld',
      description: 'Beschreibung',
      select: '5',
      checkbox: true,
      addresses: [
        {
          type: '7',
          ref: {
            title: 'Published Testorganization',
            _id: '214ca5bf-da1b-4003-b7b6-e73a2ef0ec10',
            _type: 'AddressDoc',
            _version: 2,
            _created: '2020-11-05T11:12:57.000248Z',
            _modified: '2020-11-05T11:13:19.075264Z',
            _state: 'P',
            contact: [
              {
                type: '1',
                connection: '03351464321653'
              }
            ]
          }
        }
      ],
      multiChips: '84',
      multiInputs: [
        {
          date: '2021-05-02T22:00:00.000Z',
          text: 'typ'
        }
      ],
      multiChipsSimple: 'RETURN',
      repeatDetailListLink: [
        {
          type: 'link',
          _type: 'external',
          title: 'link',
          description: 'link.link'
        }
      ],
      repeatDetailListImage: [
        {
          type: 'png',
          title: 'Image List',
          description: null
        }
      ]
    };

    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: `${Cypress.config('baseUrl')}/api/datasets?address=false&publish=${published}`,
        body: json,
        method: 'POST',
        auth: {
          bearer: tokens.access_token
        }
      });
    });
  }

  static CreateSpatialBboxWithAPI(title: string, published?: boolean) {
    const json = {
      openDataCategories: [],
      _type: 'mCloudDoc',
      title: 'api-' + title,
      mCloudCategories: [],
      geoReferenceVisual: [
        {
          value: {
            lat1: 53.01147838269375,
            lon1: 8.481445312500002,
            lat2: 53.595765008920814,
            lon2: 8.992309570312502
          },
          title: 'Bremen, 28195, Germany',
          type: 'free'
        }
      ]
    };

    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: `${Cypress.config('baseUrl')}/api/datasets?address=false&publish=${published}`,
        body: json,
        method: 'POST',
        auth: {
          bearer: tokens.access_token
        }
      });
    });
  }

  static CreateSpatialWKTWithAPI(title: string, published?: boolean) {
    const json = {
      openDataCategories: [],
      _type: 'mCloudDoc',
      title: 'api-' + title,
      mCloudCategories: [],
      geoReferenceVisual: [
        {
          wkt: 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0)(5 5, 5 7, 7 7, 7 5, 5 5))',
          title: 'create spatial reference, wkt-1',
          type: 'wkt'
        }
      ]
    };

    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: `${Cypress.config('baseUrl')}/api/datasets?address=false&publish=${published}`,
        body: json,
        method: 'POST',
        auth: {
          bearer: tokens.access_token
        }
      });
    });
  }

  static CreateSpatialBboxAndWktEntrysWithAPI(title: string, published?: boolean) {
    const json = {
      openDataCategories: [],
      _type: 'mCloudDoc',
      title: 'api-' + title,
      mCloudCategories: [],
      geoReferenceVisual: [
        {
          value: {
            lat1: 53.01147838269375,
            lon1: 8.481445312500002,
            lat2: 53.595765008920814,
            lon2: 8.992309570312502
          },
          title: 'Bremen, 28195, Germany',
          type: 'free'
        },
        {
          value: {
            lat1: 52.340373590787394,
            lon1: 13.08746337890625,
            lat2: 52.674716751777105,
            lon2: 13.760375976562502
          },
          title: 'Berlin, 10117, Germany',
          type: 'free'
        },
        {
          wkt: 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0)(5 5, 5 7, 7 7, 7 5, 5 5))',
          title: 'create spatial reference, wkt-1',
          type: 'wkt'
        },
        {
          wkt: 'POLYGON((1 5, 5 9, 1 7, 2 1, 3 5)(5 5, 5 7, 7 7, 7 5, 5 5))',
          title: 'create spatial reference, wkt-2',
          type: 'wkt'
        }
      ]
    };

    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: Cypress.config('baseUrl') + `/api/datasets?address=false&publish=${published}`,
        body: json,
        method: 'POST',
        auth: {
          bearer: tokens.access_token
        }
      });
    });
  }

  static fillCreateDialog(objectName: string) {
    cy.get('[data-cy=create-title]').type(objectName);
    cy.get('[data-cy=create-action]').click();
    cy.get('[data-cy=create-action]').should('not.exist');
  }

  static changeLocation(targetNodePath: string[]) {
    cy.get('[data-cy=create-changeLocation]').click();
    if (targetNodePath.length > 0) {
      Tree.openNode(targetNodePath, true);
    } else {
      // cy.get(`.mat-dialog-content .mat-selection-list > :first-child`).click();
      cy.get('ige-destination-selection mat-list-option').click();
    }
    cy.get('[data-cy=create-applyLocation]').click();
  }

  static publishNow() {
    // sometimes we're too fast, so that the form is not synched with the store
    cy.wait(300);
    cy.get('[data-cy=toolbar_publish_now]').click();
    cy.get('[data-cy=confirm-dialog-confirm]').click();
    cy.get('[data-cy="form-message"]').contains('veröffentlicht');
  }

  static publishLater() {
    cy.get(DocumentPage.Toolbar.Publish).click();
    cy.get('[data-cy=toolbar_publish_later]').click();
  }

  static publishRevert() {
    cy.get(DocumentPage.Toolbar.Publish).click();
    cy.get('[data-cy=toolbar_publish_revert]').click();
  }

  static saveDocument() {
    // sometimes we're too fast, so that the form is not synched with the store
    cy.wait(300);
    cy.get(DocumentPage.Toolbar.Save).click();
    cy.get('[data-cy="form-message"]').contains('gespeichert');
  }

  static checkOnlyActiveToolbarButtons(buttonIds: string[], toBeIgnored: string[] = []) {
    toBeIgnored.forEach(ignored => {
      delete DocumentPage.Toolbar[ignored];
    });
    Object.keys(DocumentPage.Toolbar).forEach(key => {
      if (buttonIds.indexOf(key) !== -1) {
        cy.get(DocumentPage.Toolbar[key]).should('be.enabled');
      } else {
        cy.get(DocumentPage.Toolbar[key]).should('be.disabled');
      }
    });
  }

  static search(searchTerm: string) {
    cy.get(DocumentPage.treeSearchBar).type(searchTerm);
  }

  static addDescription(text: string) {
    cy.get('[data-cy="Beschreibung"] textarea').clear().type(text);
  }

  static getSearchResult(number?: number) {
    number = number === undefined ? 1 : number;
    return this.getSearchResults()
      .eq(number - 1)
      .parent();
  }

  static getSearchResults() {
    return cy.get('.cdk-overlay-pane').find('ige-document-list-item');
  }

  static reloadPage() {
    cy.get('.reload-button').click();
  }

  static deleteLoadedNode() {
    cy.get(DocumentPage.Toolbar['Delete']).click();
    cy.intercept('DELETE', /api\/datasets/).as('deleteRequest');
    cy.get('[data-cy="confirm-dialog-confirm"]').click();
    cy.wait('@deleteRequest', { timeout: 10000 });
  }

  static refreshDashboard() {
    return cy.get('[data-cy=reload-button]').click();
  }

  static checkSpatialEntrytNotEmpty() {
    cy.get('ige-spatial-list mat-list-item').should('not.empty');
  }

  static checkSpatialEntryNumber(count: number) {
    cy.get('div.mat-line.spatial-title').should('have.length', count);
  }

  static checkSpatialEntryExists(spatialName: string) {
    cy.get('div.mat-line.spatial-title').contains(spatialName).should('exist');
  }

  static checkSpatialEntryExistsNot(spatialName: string) {
    cy.get('div.mat-line.spatial-title').contains(spatialName).should('not.exist');
  }

  static clickSpatialEntry(spatialName: string) {
    cy.get('ige-formly--type mat-list div.mat-line').contains(spatialName).click({ force: true });
  }

  static clickLeafletMapResetBtn() {
    cy.get('path.leaflet-interactive').should('exist');
    cy.get('formly-field .mat-button-wrapper').contains('Zurücksetzen').click();
  }

  static checkURL(text: string) {
    cy.url().should('include', text);
  }

  static saveProfile(docTitle: string) {
    cy.intercept('PUT', /api\/datasets/).as('saveChanges');
    cy.get(DocumentPage.Toolbar.Save).click();
    cy.wait('@saveChanges').its('response.body.title').should('eq', docTitle);
  }
}
