import { BasePage, UserAndRights } from './base.page';

export class AdminGroupPage extends BasePage {
  static goToTabmenu(tabmenu: UserAndRights) {
    cy.get('mat-tab-header .mat-tab-label:nth-child(' + tabmenu + '', { timeout: 10000 }).click();
  }

  static applyDialog() {
    cy.get('button').contains('Anlegen').click();
    cy.wait(100);
  }

  static toolbarSaveGroup() {
    cy.intercept('GET', '/api/groups/**').as('completeEditingRequest');
    cy.get('[data-cy=toolbar_save_group]').click();
    cy.wait('@completeEditingRequest');
  }

  static toolbarSaveUser() {
    cy.get('[data-cy=toolbar_save_user]').click();
    cy.intercept('GET', '/api/users/**').as('completeEditingRequest');
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
    cy.get('groups-table').contains(groupName).click();
    cy.get('#formRoles').should('be.visible');
  }

  static confirmDeletingIntention() {
    cy.get('mat-dialog-container');
    cy.contains('button', 'Löschen').click();
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
    this.confirmDeletingIntention();
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
    cy.contains('mat-tree-node', docName).should('be.disabled');
    cy.get('mat-dialog-actions button').contains('Hinzufügen').should('be.disabled');
  }
}
