import {Utils} from './utils';
import {BasePage} from './base.page';
import {Tree} from './tree.partial';

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
    Revert: '[data-cy=toolbar_REVERT]',
    Delete: '[data-cy=toolbar_DELETE]',
    Previous: '[data-cy=toolbar_HISTORY_PREVIOUS]',
    Next: '[data-cy=toolbar_HISTORY_NEXT]',
    Save: '[data-cy=toolbar_SAVE]',
    Publish: '[data-cy=toolbar_PUBLISH]'
  };

  static AddAddressDialog = class {

    static search(searchString: string) {
      cy.get('[data-cy="choose-address-tree"]').findByPlaceholderText('Suchen').click();
      cy.get('[data-cy="choose-address-tree"]').findByPlaceholderText('Suchen').type(searchString);
    };

    static searchAndAdd(searchString: string, addressType: string) {
      // TODO replace addressType with proper addressType class or enum
      this.search(searchString);
      cy.wait(500);
      cy.get('ige-document-list-item').contains(searchString).click();
      cy.get('[data-cy="address-type-select"]').click();
      cy.get('mat-option').contains(addressType).click();
      cy.get('[data-cy="choose-address-confirm"]').click();
    }

  };

  static visit() {
    cy.visit('form');
  }

  static visitSingleDoc() {
    cy.visit('form;id=7e9687e8-43f4-4b95-bdcb-27647197a8cb');
  }

  static createDocument(docName: string) {
    cy.log('Create Document: ' + docName);
    cy.get(DocumentPage.Toolbar.NewDoc).click();
    this.fillDialog(docName);
  }

  static createFolder(folderName: string) {
    cy.log('Create folder: ' + folderName);
    cy.get(DocumentPage.Toolbar.NewFolder).click();
    this.fillDialog(folderName);
  }

  private static fillDialog(title: string) {
    let beforeLength = 0;
    Tree.getNumberOfNodes().then(length => {
      beforeLength = length;
      this.fillCreateDialog(title);
      cy.get('mat-tree mat-tree-node')
        .should('have.length.at.least', beforeLength + 1);
    });
  }

  static CreateFullMcloudDocumentWithAPI(title: string, published?: boolean){
    const json = {
      _hasChildren: false,
      _parent: "a0df9837-512a-4594-b2ef-2814f7c55c81",
      _type: "mCloudDoc",
      title: title,
      _state: "W",
      _version: 1,
      description: "Beschreibung",
      addresses: [{
          type: "10",
          ref: {
            _type: "AddressDoc",
            title: "Published Testorganization",
            _parent: null,
            firstName: "",
            lastName: "",
            organization: "Published Testorganization",
            contact: [{type: "1",connection: "03351464321653"}],
            _state: "P"
          }
      }],
      usage: "Nutzungshinweise",
      mCloudCategories: ["roads"],
      openDataCategories: ["TRAN"],
      downloads: [{link: "link.link", type: "linktyp"}],
      license: "Andere offene Lizenz",
      origin: "Vermerk",
      mfundProject: "Projekt",
      mfundFKZ: "FKZ",
      geoReferenceVisual: [{
        value: {lat1: 53.01147838269375, lon1: 8.481445312500002, lat2: 53.608803292930894, lon2: 8.989562988281252},
      title: "Bremen, Germany",
      type: "free"}],
      events: [{text: "1", date: "2020-10-25T23:00:00.000Z"}],
      timeSpan: {
        rangeType: "range",
        timeSpanRange: {
          start: "2020-04-30T22:00:00.000Z",
          end: "2020-10-30T23:00:00.000Z"
        }
      },
      periodicity: "8"
    };

    cy.request('POST', (Cypress.config("baseUrl")) + `/api/datasets?address=false&publish=${published}`, json);
  }

  static CreateSpatialBboxWithAPI(title: string, published?: boolean){
    const json = {
      openDataCategories: [],
      _type: "mCloudDoc",
      title: "api-" + title,
      mCloudCategories: [],
      geoReferenceVisual: [{
          value: {lat1: 53.01147838269375, lon1: 8.481445312500002, lat2: 53.595765008920814, lon2: 8.992309570312502},
          title: "Bremen, 28195, Germany",
          type: "free"}]
    };

    cy.request('POST', (Cypress.config("baseUrl")) + `/api/datasets?address=false&publish=${published}`, json);
  }

  static CreateMCloudDocument(data: {title?: string, description?: string}, published?: boolean){
    const json = {
      _hasChildren: false,
      _parent: "a0df9837-512a-4594-b2ef-2814f7c55c81",
      _type: "mCloudDoc",
      title: "MCloud Dokument",
      _state: "W",
      _version: 1,
      description: "Beschreibung",
      addresses: [{
        type: "10",
        ref: {
          _type: "AddressDoc",
          title: "Published Testorganization",
          _parent: null,
          firstName: "",
          lastName: "",
          organization: "Published Testorganization",
          contact: [{type: "1",connection: "03351464321653"}],
          _state: "P"
        }
      }],
      usage: "Nutzungshinweise",
      mCloudCategories: ["roads"],
      openDataCategories: ["TRAN"],
      downloads: [{link: "link.link", type: "linktyp"}],
      license: "Andere offene Lizenz",
      origin: "Vermerk",
      mfundProject: "Projekt",
      mfundFKZ: "FKZ",
      geoReferenceVisual: [{
        value: {lat1: 53.01147838269375, lon1: 8.481445312500002, lat2: 53.608803292930894, lon2: 8.989562988281252},
        title: "Bremen, Germany",
        type: "free"}],
      events: [{text: "1", date: "2020-10-25T23:00:00.000Z"}],
      timeSpan: {
        rangeType: "range",
        timeSpanRange: {
          start: "2020-04-30T22:00:00.000Z",
          end: "2020-10-30T23:00:00.000Z"
        }
      },
      periodicity: "8"
    };

    // merge default document with data from parameter
    Object.assign(json, data);

    cy.request('POST', (Cypress.config("baseUrl")) + `/api/datasets?address=false&publish=${published}`, json);
  }

  static CreateSpatialWKTWithAPI(title: string, published?: boolean){
    const json = {
      openDataCategories: [],
      _type: "mCloudDoc",
      title: "api-" + title,
      mCloudCategories: [],
      geoReferenceVisual: [{
        wkt: "POLYGON((0 0, 0 10, 10 10, 10 0, 0 0)(5 5, 5 7, 7 7, 7 5, 5 5))",
        title: "create spatial reference, wkt-1",
        type: "wkt"}]
    };

    cy.request('POST', (Cypress.config("baseUrl")) + `/api/datasets?address=false&publish=${published}`, json);
  }

  static CreateSpatialBboxAndWktEntrysWithAPI(title: string, published?: boolean){
    const json = {
      openDataCategories: [],
      _type: "mCloudDoc",
      title: "api-" + title,
      mCloudCategories: [],
      geoReferenceVisual: [{
          value: {lat1: 53.01147838269375, lon1: 8.481445312500002, lat2: 53.595765008920814, lon2: 8.992309570312502},
          title: "Bremen, 28195, Germany",
          type: "free"},
        {
          value: {lat1: 52.340373590787394, lon1: 13.08746337890625, lat2: 52.674716751777105, lon2: 13.760375976562502},
          title: "Berlin, 10117, Germany",
          type: "free"
        }, {
          wkt: "POLYGON((0 0, 0 10, 10 10, 10 0, 0 0)(5 5, 5 7, 7 7, 7 5, 5 5))",
          title: "create spatial reference, wkt-1",
          type: "wkt"
        }, {
          wkt: "POLYGON((1 5, 5 9, 1 7, 2 1, 3 5)(5 5, 5 7, 7 7, 7 5, 5 5))",
          title: "create spatial reference, wkt-2",
          type: "wkt"
      }]
    };

    cy.request('POST', (Cypress.config("baseUrl")) + `/api/datasets?address=false&publish=${published}`, json);
  }

  static fillCreateDialog(objectName: string) {
    cy.get('[data-cy=create-title]').type(objectName);
    cy.get('[data-cy=create-action]').click();
    cy.get('[data-cy=create-action]').should('not.be.visible');
  }

  /**
   * @deprecated combine with createFolder function
   * @param folderName
   * @param targetNodePath
   */
  static createFolderAndChangeLocation(folderName: string, targetNodePath: string[]){
    cy.get(DocumentPage.Toolbar.NewFolder).click();
    cy.get('[data-cy=create-title]').type(folderName);
    this.changeLocation(targetNodePath);
  }

  static changeLocation(targetNodePath: string[]){
    cy.get('[data-cy=create-changeLocation]').click();
    if (targetNodePath) {
      targetNodePath.forEach(node => Tree.openNode([node], true));
    } else {
      cy.get(`.mat-dialog-content .mat-selection-list > :first-child`).click();
    }
    cy.get('[data-cy=create-applyLocation]').click();
    cy.get('[data-cy=create-action]').click();
  }

  /**
   * @deprecated combine with createFolder function
   * @param folderName
   * @param targetNodePath
   */
  static createFolderAndChangeLocationToRoot(folderName: string, targetNodePath: string[]){
    cy.get(DocumentPage.Toolbar.NewFolder).click();
    cy.get('[data-cy=create-title]').type(folderName);
    cy.get('[data-cy=create-changeLocation]').click();
    if (targetNodePath[0] == 'Daten'){
      cy.get('ige-destination-selection mat-list-option').click();
      //check if 'Daten' is chosen
      cy.get("[aria-selected=true]").contains("Daten");
    } else if (targetNodePath[0] == 'Adressen') {
      cy.get('ige-destination-selection mat-list-option').click();
      //check if 'Adressen' is chosen
      cy.get("[aria-selected=true]").contains("Adressen");
    }
    cy.get('[data-cy=create-applyLocation]').click();
    cy.get('[data-cy=create-action]').click();
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

  static checkOnlyActiveToolbarButtons(buttonIds: string[]) {
    Object.keys(DocumentPage.Toolbar).forEach(key => {
      if (buttonIds.indexOf(key) !== -1) {
        cy.get(DocumentPage.Toolbar[key]).should('be.enabled');
      } else {
        cy.get(DocumentPage.Toolbar[key]).should('be.disabled');
      }
    })
  }

  static search(searchTerm: string) {
    cy.get(DocumentPage.treeSearchBar).type(searchTerm);
  }

  static getSearchResult(number?: number) {
    number = number == undefined ? 1 : number;
    return this.getSearchResults().eq(number - 1).parent();
  }

  static getSearchResults() {
    return cy.get('.cdk-overlay-pane').find('ige-document-list-item');
  }

  static deleteLoadedNode() {
    cy.get(DocumentPage.Toolbar['Delete']).click()
    cy.get('[data-cy="confirm-dialog-confirm"]').click()
  }

  static refreshDashboard(){
    return cy.get('[data-cy=reload-button]').click()
  }

  static checkSpatialEntrytNotEmpty(){
    cy.get('ige-spatial-list mat-list-item').should('not.empty');
  }

  static checkSpatialEntryExists(spatialName: string){
    cy.wait(50);
    cy.get('div.mat-line.spatial-title').contains(spatialName).should( 'exist');
  }

  static checkSpatialEntryExistsNot(spatialName: string){
    cy.wait(50);
    cy.get('div.mat-line.spatial-title').contains(spatialName).should( 'not.exist');
  }

  static clickSpatialEntry(spatialName: string){
    cy.get('ige-formly--type mat-list').find('div.mat-line.spatial-title').contains(spatialName).click()
  }

  static clickLeafletMapResetBtn(){
    cy.get('path.leaflet-interactive').should( 'exist');
    cy.get('formly-field .mat-button-wrapper').contains('Zurücksetzen').click();
  }

  static checkURL(text: string){
    cy.url().should('include', text);
  }
}
