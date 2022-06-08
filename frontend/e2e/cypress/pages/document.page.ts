import { BasePage } from './base.page';
import { Tree } from './tree.partial';
import Chainable = Cypress.Chainable;

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
      Tree.openNodeInsideDialog([nodeTitle]);
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
    Publish: '[data-cy=toolbar_PUBLISH]',
    PublishNow: '[data-cy=toolbar_publish_now]'
    // JSON: '[data-cy=toolbar_SHOW_JSON]'
  };

  static AddAddressDialog = class {
    static search(searchString: string) {
      cy.get('[data-cy="choose-address-tree"]').findByPlaceholderText('Suchen').click();
      cy.get('[data-cy="choose-address-tree"]').findByPlaceholderText('Suchen').type(searchString);
    }

    static searchAndSelect(searchString: string) {
      this.search(searchString);
      // result can be detached form dom so we need to wait a bit, see: https://github.com/cypress-io/cypress/issues/7306
      cy.wait(1000);
      cy.contains('ige-document-list-item', searchString, { timeout: 8000 }).click();
    }
  };

  static visit() {
    cy.intercept({ method: 'GET', url: '/api/tree/children', times: 1 }).as('treeCall');
    cy.visit('form');
    cy.wait('@treeCall', { timeout: 15000 });
  }

  static visitSingleDoc() {
    cy.visit('form;id=d94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3');
  }

  static createDocument(docName: string) {
    cy.log('Create Document: ' + docName);
    cy.get(DocumentPage.Toolbar.NewDoc, { timeout: 18000 }).click();
    this.fillDialog(docName);
    // wait, since creation of node leads to activation and navigation, which will result
    // in jumping back to form (in case we jump to another page after creation)
    cy.wait(500);
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
      cy.get('mat-tree mat-tree-node').should('have.length.at.least', beforeLength + 1, { timeout: 6000 });
    });
  }

  static CreateFullMcloudDocumentWithAPI(title: string, published = false, parentNode: any = 1) {
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
          type: { key: '10' },
          ref: '214ca5bf-da1b-4003-b7b6-e73a2ef0ec10'
        }
      ],
      accessRights: 'Nutzungshinweise',
      mCloudCategories: ['roads'],
      DCATThemes: ['TRAN'],
      distributions: [
        {
          link: { value: 'link.link', asLink: true },
          type: { key: 'atomFeed' },
          format: { key: 'EPUB' }
        }
      ],
      license: { key: '10' },
      origin: 'Vermerk',
      mfundProject: 'Projekt',
      mfundFKZ: 'FKZ',
      spatial: [
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
      events: [{ text: { key: '1' }, date: '2020-10-25T23:00:00.000Z' }],
      temporal: {
        rangeType: { key: 'range' },
        timeSpanRange: {
          start: '2020-04-30T22:00:00.000Z',
          end: '2020-10-30T23:00:00.000Z'
        }
      },
      periodicity: { key: '8' }
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

  static CreateSimpleMcloudDocumentWithAPI(title: string, published = false, parentNode: any = 1) {
    const json = {
      _hasChildren: false,
      _parent: parentNode,
      _type: 'mCloudDoc',
      title: title,
      _state: 'W',
      _version: 1,
      addresses: [],
      mCloudCategories: [],
      DCATThemes: [],
      distributions: [],
      spatial: [],
      events: []
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

  static CreateNegativePreauditDocumentWithAPI(title: string) {
    const json = {
      title: title,
      _type: 'UvpNegativePreliminaryAssessmentDoc',
      decisionDate: '2021-09-19T22:00:00.000Z',
      _parent: null
    };

    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: `${Cypress.config('baseUrl')}/api/datasets?address=false&publish=false`,
        body: json,
        method: 'POST',
        auth: {
          bearer: tokens.access_token
        }
      });
    });
  }

  static CreateLinienbestimmungdocumentWithAPI(title: string) {
    const json = {
      title: title,
      _type: 'UvpLineDeterminationDoc',
      spatial: null,
      eiaNumbers: [
        {
          key: '10'
        }
      ],
      pointOfContact: null,
      processingSteps: [
        {
          type: 'decisionOfAdmission',
          approvalDocs: null,
          decisionDate: '2022-04-11T22:00:00.000Z',
          decisionDocs: null
        }
      ],
      _parent: null
    };

    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: `${Cypress.config('baseUrl')}/api/datasets?address=false&publish=false`,
        body: json,
        method: 'POST',
        auth: {
          bearer: tokens.access_token
        }
      });
    });
  }

  static CreateZulassungsverfahrenDocumentWithAPI(title: string) {
    const json = {
      title: title,
      _type: 'UvpApprovalProcedureDoc',
      spatial: null,
      eiaNumbers: [],
      description: null,
      pointOfContact: null,
      processingSteps: [
        {
          type: 'decisionOfAdmission',
          approvalDocs: null,
          decisionDate: '2022-05-01T22:00:00.000Z',
          decisionDocs: null
        }
      ],
      prelimAssessment: true,
      _parent: null
    };

    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: `${Cypress.config('baseUrl')}/api/datasets?address=false&publish=false`,
        body: json,
        method: 'POST',
        auth: {
          bearer: tokens.access_token
        }
      });
    });
  }

  static CreateRaumordnungverfahrenDocumentWithAPI(
    title: string,
    receiptDate: string = '2020-11-05T23:00:00.000Z',
    decisionDate: string = '2022-03-18T23:00:00.000Z'
  ) {
    const json = {
      title: title,
      _type: 'UvpSpatialPlanningProcedureDoc',
      spatial: null,
      eiaNumbers: [],
      description: null,
      receiptDate: receiptDate,
      pointOfContact: null,
      processingSteps: [
        {
          type: 'publicDisclosure',
          furtherDocs: null,
          disclosureDate: {
            end: '2021-04-27T22:00:00.000Z',
            start: '2021-04-09T22:00:00.000Z'
          },
          applicationDocs: null,
          announcementDocs: null,
          reportsRecommendationDocs: null
        },
        {
          type: 'publicHearing',
          considerationDocs: null,
          publicHearingDate: {
            end: '2021-09-28T22:00:00.000Z',
            start: '2021-09-11T22:00:00.000Z'
          }
        },
        {
          type: 'decisionOfAdmission',
          approvalDocs: null,
          decisionDate: decisionDate,
          decisionDocs: null
        }
      ],
      _parent: null
    };

    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: `${Cypress.config('baseUrl')}/api/datasets?address=false&publish=false`,
        body: json,
        method: 'POST',
        auth: {
          bearer: tokens.access_token
        }
      });
    });
  }

  static CreateForeignProjectDocumentWithAPI(title: string, spatial: any = []) {
    const json = {
      title: title,
      _type: 'UvpForeignProjectDoc',
      description: 'Beschreibung',
      pointOfContact: [
        {
          type: {
            key: '7'
          },
          ref: {
            title: 'Adresse, Organisation_6',
            hasWritePermission: true,
            hasOnlySubtreeWritePermission: false,
            _uuid: 'c3bfe0ec-9bcb-4db2-b124-2d4cd088cb3a',
            _type: 'UvpOrganisationDoc',
            _version: 1,
            _created: '2022-04-20T17:07:11.875239+02:00',
            _modified: '2022-04-20T17:09:19.985346+02:00',
            _createdBy: 'uvp catalog',
            _modifiedBy: 'uvp catalog',
            _state: 'P',
            _id: '12258',
            address: {
              city: null,
              'po-box': null,
              street: null,
              country: {
                key: '276'
              },
              'zip-code': null,
              'zip-po-box': null
            },
            contact: [
              {
                type: {
                  key: '1'
                },
                connection: '98473627438'
              }
            ],
            organization: 'Adresse, Organisation_6',
            _parent: 12263,
            _hasChildren: false,
            _parentIsFolder: true,
            _pendingDate: null
          }
        }
      ],
      spatial: spatial,
      processingSteps: [],
      _parent: null
    };

    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: `${Cypress.config('baseUrl')}/api/datasets?address=false&publish=false`,
        body: json,
        method: 'POST',
        auth: {
          bearer: tokens.access_token
        }
      });
    });
  }

  static CreateExtendedForeignProjectDocumentWithAPI(title: string, spatial: any = [], steps: any = []) {
    const json = {
      title: title,
      _type: 'UvpForeignProjectDoc',
      description: 'Beschreibung',
      pointOfContact: [
        {
          type: {
            key: '7'
          },
          ref: {
            title: 'Adresse, Organisation_6',
            hasWritePermission: true,
            hasOnlySubtreeWritePermission: false,
            _uuid: 'c3bfe0ec-9bcb-4db2-b124-2d4cd088cb3a',
            _type: 'UvpOrganisationDoc',
            _version: 1,
            _created: '2022-04-20T17:07:11.875239+02:00',
            _modified: '2022-04-20T17:09:19.985346+02:00',
            _createdBy: 'uvp catalog',
            _modifiedBy: 'uvp catalog',
            _state: 'P',
            _id: '12258',
            address: {
              city: null,
              'po-box': null,
              street: null,
              country: {
                key: '276'
              },
              'zip-code': null,
              'zip-po-box': null
            },
            contact: [
              {
                type: {
                  key: '1'
                },
                connection: '98473627438'
              }
            ],
            organization: 'Adresse, Organisation_6',
            _parent: 12263,
            _hasChildren: false,
            _parentIsFolder: true,
            _pendingDate: null
          }
        }
      ],
      spatial: spatial,
      processingSteps: steps,
      _parent: null
    };

    cy.get('@tokens').then((tokens: any) => {
      cy.request({
        url: `${Cypress.config('baseUrl')}/api/datasets?address=false&publish=false`,
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
      _parent: 1,
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
          type: { key: '7' },
          ref: {
            title: 'Published Testorganization',
            _uuid: '214ca5bf-da1b-4003-b7b6-e73a2ef0ec10',
            _type: 'McloudAddressDoc',
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
      DCATThemes: [],
      _type: 'mCloudDoc',
      title: 'api-' + title,
      mCloudCategories: [],
      spatial: [
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
      DCATThemes: [],
      _type: 'mCloudDoc',
      title: 'api-' + title,
      mCloudCategories: [],
      spatial: [
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
      DCATThemes: [],
      _type: 'mCloudDoc',
      title: 'api-' + title,
      mCloudCategories: [],
      spatial: [
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
      Tree.openNodeInsideDialog(targetNodePath);
    } else {
      // cy.get(`.mat-dialog-content .mat-selection-list > :first-child`).click();
      cy.get('ige-destination-selection mat-list-option').click();
    }
    cy.get('[data-cy=create-applyLocation]').click();
  }

  static publishNow() {
    // sometimes we're too fast, so that the form is not synched with the store
    cy.wait(300);
    cy.get(DocumentPage.Toolbar.PublishNow).click();
    cy.get(PublishOptions.ConfirmPublish).click();
    cy.get('[data-cy="form-message"]').contains('veröffentlicht');
  }

  static planPublishing(date: string, inDialog: boolean = false) {
    this.choosePublishOption(inDialog ? PublishOptions.PlanPublishInDialog : PublishOptions.PlanPublish, inDialog);
    this.fillInPublishingDate(date);
    cy.contains('button', 'Ok').click();
    cy.contains('ige-publish-pending', new RegExp(`(Datensatz|Vorhaben) wird am ${date.toString()} veröffentlicht`));
  }

  static choosePublishOption(option: PublishOptions, inDialog: boolean = false) {
    cy.get(inDialog ? DocumentPage.Toolbar.PublishNow : DocumentPage.Toolbar.Publish).click();
    cy.get(option).click();
  }

  static fillInPublishingDate(date: string) {
    cy.get('delayed-publish-dialog [formcontrolname="date"]').clear().type(date);
  }

  static saveDocument() {
    // sometimes we're too fast, so that the form is not synched with the store
    cy.wait(300);
    cy.get(DocumentPage.Toolbar.Save).click();
    cy.contains('[data-cy="form-message"]', 'gespeichert', { timeout: 10000 });
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
    cy.get(DocumentPage.treeSearchBar).should('be.enabled').type(searchTerm);
  }

  static addDescription(text: string) {
    cy.get('[data-cy="Beschreibung"] textarea').clear().type(text);
  }

  static scrollToSection(section: string) {
    cy.contains('ige-header-navigation .link-button', section, { timeout: 10000 }).click();
  }

  /**
   * @param sourceNode
   * @param targetNode
   * @param xCoordinate is how much the chip should be dragged horizontally
   * @param yCoordinate is how much the chip should be dragged vertically
   * @param  useCoordinates some tests cannot use drag and drop without coordinates
   */
  static dragItem(
    sourceNode: string,
    targetNode: string,
    xCoordinate: number = 0,
    yCoordinate: number = 0,
    useCoordinates: boolean = false
  ) {
    // it is supposed to use trigger dragstart and trigger start drop, but it does not work here with categories
    cy.get(sourceNode)
      .drag(targetNode, {
        force: true // applied to both the source and target element
      })
      .then(success => {
        assert.isTrue(success);
        cy.wait(300);
        if (!useCoordinates) {
          cy.get(targetNode).click();
        }
      });

    // we need the code below for test that use coordinates
    if (useCoordinates) {
      cy.get(sourceNode).trigger('mousemove', xCoordinate, yCoordinate, { force: true });
      cy.get(sourceNode).trigger('mouseup', { force: true });
    }
  }

  static checkOfExistingItem(node: string, itemName: string, index: number = -1, inputString: boolean = false) {
    if (index != -1) {
      if (inputString) {
        cy.get(node).eq(index).should('have.value', itemName);
      } else {
        cy.get(node).eq(index).contains(itemName);
      }
    } else {
      if (inputString) {
        cy.get(node).should('have.value', itemName);
      } else {
        cy.get(node).contains(itemName);
      }
    }
  }

  static getSearchResult(number = 1) {
    return this.getSearchResults()
      .should('have.length.gte', 1)
      .eq(number - 1)
      .parent();
  }

  static getSearchResults() {
    return cy.get('.cdk-overlay-pane').find('ige-document-list-item');
  }

  static deleteLoadedNode() {
    cy.get(DocumentPage.Toolbar['Delete']).click();
    cy.intercept('DELETE', /api\/datasets/).as('deleteRequest');
    cy.get('[data-cy="confirm-dialog-confirm"]').click();
    cy.wait('@deleteRequest', { timeout: 10000 });
  }

  static checkSpatialEntrytNotEmpty() {
    cy.get('ige-spatial-list mat-list-item').should('not.empty');
  }

  static checkSpatialEntryNumber(count: number) {
    cy.get('div.mat-line.spatial-title', { timeout: 8000 }).should('have.length', count);
  }

  static checkSpatialEntryExists(spatialName: string) {
    cy.get('div.mat-line.spatial-title').contains(spatialName).should('exist');
  }

  static checkSpatialEntryExistsNot(spatialName: string) {
    cy.get('div.mat-line.spatial-title').contains(spatialName).should('not.exist');
  }

  static clickSpatialEntry(spatialName: string) {
    cy.get('ige-formly-leaflet-type mat-list div.mat-line').contains(spatialName).click({ force: true });
  }

  static jumpFromDocumentToAddress(addressTitle: string, id?: number) {
    cy.get('ige-address-card').should('exist');
    cy.get('ige-address-card [svgicon="Mehr"]').click();
    cy.get('.mat-menu-content', { timeout: 10000 }).should('exist');
    cy.contains('button', 'Hinspringen', { timeout: 10000 }).click();
    cy.contains(DocumentPage.title, addressTitle, { timeout: 10000 });
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

  static openUpDocumentHeader() {
    cy.get('.title').within(_ => {
      cy.findByText('keyboard_arrow_down').click();
    });
  }

  static checkEmptyDocumentTree() {
    cy.get('ige-empty-navigation').contains('Leer');
  }

  static verifyInfoInDocumentHeader(key: headerElements, value: string) {
    cy.get('.more-info div[fxlayout="row"]:nth-child(' + key + ')').within(() => {
      cy.get('div')
        .eq(1)
        .should($el => expect($el.text().trim()).to.equal(value));
    });
  }

  static getInfoInDocumentHeader(key: headerElements): Chainable<string> {
    return cy
      .get('.more-info div[fxlayout="row"]:nth-child(' + key + ') div')
      .eq(1)
      .then(el => {
        return el.text().trim();
      });
  }

  static editRowInDownloadTable(tableName: string, fileName: string, editAction: 'Löschen' | 'Bearbeiten') {
    cy.contains(`[data-cy="${tableName}"] mat-row`, fileName).within(_ => {
      cy.get('[svgicon="Mehr"]').click();
    });
    cy.contains('.mat-menu-panel button', editAction).click();
  }

  static editDownloadTableEntry(field: fieldsForDownloadEntry, value: string) {
    cy.get('ige-form-dialog mat-form-field input').eq(field).type(value);
    cy.contains('button', 'Ok').click();
  }
}

export enum PublishOptions {
  PlanPublish = '[data-cy="toolbar_PLAN"]',
  PlanPublishInDialog = '[data-cy="confirm-dialog-plan"]',
  RevertPublish = '[data-cy="toolbar_REVERT"]',
  Unpublish = '[data-cy="toolbar_UNPUBLISH"]',
  ConfirmPublish = '[data-cy=confirm-dialog-confirm]'
}

export enum headerElements {
  Status = 1,
  Type,
  ID,
  CreationDate,
  EditDate
}

export enum fieldsForDownloadEntry {
  Title = 0,
  Link,
  ValidUntil
}
