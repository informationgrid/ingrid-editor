import { BasePage, UserAndRights } from './base.page';

export class AdminGroupPage extends BasePage {
  static goToTabmenu(tabmenu: UserAndRights) {
    cy.get('a.mat-tab-link[href="' + tabmenu + '"]', { timeout: 10000 }).click();
  }

  static applyDialog() {
    cy.get('button').contains('Anlegen').click();
    cy.wait(100);
  }

  static getNextPage() {
    cy.get('.mat-paginator-navigation-next').click();
    cy.wait(100);
  }

  static toolbarSaveGroup() {
    cy.intercept('GET', '/api/groups/**').as('completeEditingRequest');
    cy.get('[data-cy=toolbar_save_group]').click();
    cy.wait('@completeEditingRequest');
  }

  static toolbarSaveUser() {
    cy.intercept('PUT', '/api/users/**').as('completeEditingRequest');
    cy.get('[data-cy=toolbar_save_user]').click();
    cy.wait('@completeEditingRequest');
  }

  static addNewGroup(groupname: string) {
    cy.get('mat-toolbar button').contains('Hinzufügen').click();
    cy.get('ige-new-group-dialog').contains('Gruppe hinzufügen').should('be.visible');
    cy.get('ige-new-group-dialog mat-form-field input').click().clear().type(groupname);
    this.applyDialog();
  }

  static verifyNewlyCreatedGroup(groupname: string, description: string) {
    cy.get('groups-table').should('contain', groupname);
    cy.get('groups-table').should('contain', description);
  }

  static addGroupDescription(description: string) {
    cy.get('textarea').click().clear().type(description);
  }

  static selectGroup(groupName: string) {
    cy.intercept('GET', '/api/groups/*').as('fetchGroupRequest');
    cy.get('groups-table').contains(groupName).click();
    cy.wait('@fetchGroupRequest');
    cy.get('#formRoles').should('be.visible');
  }

  static CreationDate = '.more-info div[fxlayout="row"]:nth-child(1) > div span';
  static LastEditedDate = '.more-info div[fxlayout="row"]:nth-child(2) > div span';
  static ID = '.more-info div[fxlayout="row"]:nth-child(3) div:nth-child(2)';

  static confirmDeletingIntention() {
    cy.get('mat-dialog-container');
    cy.contains('button', 'Löschen').click();
  }

  static openUpGroupHeader() {
    cy.get('.user-title .menu-button').eq(0).click();
  }

  static deleteDocumentFromGroup(docName: string, docType: string) {
    const documentType = new RegExp(docType);
    cy.contains('permission-table', documentType)
      .findByText(docName)
      .parent()
      .parent()
      .within(() => {
        cy.get('[svgicon="Mehr"]').click();
      });
    cy.contains('button', 'Entfernen').click();
    //this.confirmDeletingIntention();
  }

  static deleteGroup(groupName: string) {
    cy.contains('.mat-table .mat-row', groupName)
      .find('button:nth-child(1) > span:nth-child(1) > mat-icon:nth-child(1)')
      .invoke('show')
      .click({ force: true });
    cy.contains('button', 'Löschen').click();
    cy.get('mat-dialog-container');
    cy.intercept('DELETE', '/api/groups/**');
    cy.contains('button', 'Gruppe löschen').click();
  }

  static openAddDocumentsDialog(docType: string) {
    const documentType = new RegExp(docType);
    cy.contains('permission-table', documentType)
      .find('ige-add-button')
      .within(() => {
        cy.get('button').click();
      });
    cy.get('permission-add-dialog');
  }

  static addDocumentToGroup(docName: string, docType: string) {
    this.openAddDocumentsDialog(docType);
    cy.get('permission-add-dialog');
    cy.intercept('GET', /address=false/, {
      statusCode: 200,
      body: {
        title: docName
      }
    }).as('waitRequest');
    cy.contains('mat-tree-node', docName).click();
    cy.get('mat-dialog-actions button').contains('Hinzufügen').click();
    cy.wait('@waitRequest');
  }

  static tryIllegitimateAddToGroup(docName: string, docType: string) {
    this.openAddDocumentsDialog(docType);
    cy.get('permission-add-dialog');
    cy.contains('mat-tree-node', docName).should('have.class', 'disabled');
    cy.get('mat-dialog-actions button').contains('Hinzufügen').parent().should('have.class', 'mat-button-disabled');
  }

  static verifyInfoInHeader(key: headerKeys, value: string) {
    // open up header
    cy.get('.user-title .menu-button').eq(0).click();
    // verify information
    cy.get('.more-info div[fxlayout="row"]:nth-child(' + key + ')').within(() => {
      cy.get('div').eq(1).should('have.text', value);
    });
  }
}

export enum headerKeys {
  CreationDate = 1,
  EditDate,
  identification
}
