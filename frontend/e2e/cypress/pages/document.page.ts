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
      Tree.selectNodeWithTitle(nodeTitle, true);
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

  static createDocument(docName?: string): string {
    cy.get(DocumentPage.Toolbar.NewDoc).click();
    return this.fillCreateDialog(docName);
  }

  static createFolder(folderName?: string): string {
    cy.get(DocumentPage.Toolbar.NewFolder).click();
    return this.fillCreateDialog(folderName);
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

  static fillCreateDialog(objectName?: string){
    objectName = objectName ? objectName : 'Test-Objekt ' + Utils.randomString();
    cy.get('[data-cy=create-title]').type(objectName);
    cy.get('[data-cy=create-action]').click();
    cy.get('[data-cy=create-action]').should('not.be.visible');
    return objectName;
  }

  static createFolderAndChangeLocation(folderName: string, targetNodePath: string[]){
    cy.get(DocumentPage.Toolbar.NewFolder).click();
    cy.get('[data-cy=create-title]').type(folderName);
    this.changeLocation(targetNodePath);
  }

  static changeLocation(targetNodePath: string[]){
    cy.get('[data-cy=create-changeLocation]').click();
    if (targetNodePath) {
      targetNodePath.forEach(node => Tree.selectNodeWithTitle(node, true));
    } else {
      cy.get(`.mat-dialog-content .mat-selection-list > :first-child`).click();
    }
    cy.get('[data-cy=create-applyLocation]').click();
    cy.get('[data-cy=create-action]').click();
  }

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

  /**
   * TODO: we should not open a document that contains some string, the depending tests can break easily!
   * use Tree.openNode() instead!
   * @deprecated
   */
  static getDocument(docNameContains: string){
    cy.get('#sidebar').contains(docNameContains).click();
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
