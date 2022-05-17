import { BasePage, UserAndRights } from './base.page';

export interface GroupFormData {
  name: string;
  description: string;
  permissionsData: string[];
  permissionsAddress: string[];
}

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

  static saveGroup() {
    cy.intercept('PUT', '/api/groups/**').as('completeEditingRequest');
    cy.get('[data-cy=toolbar_save_group]').click();
    cy.wait('@completeEditingRequest');
  }

  static groupShouldNotExist(name: string) {
    cy.get('[data-cy=search]').clear().type(name);
    cy.get('groups-table .mat-row').should('have.length', 0);
  }

  static groupShouldExist(name: string) {
    cy.get('[data-cy=search]').clear().type(name);
    cy.get('groups-table .mat-row').should('have.length', 1);
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
    cy.get('textarea').clear().type(description);
  }

  static updateGroup(data: Partial<GroupFormData>, save = true) {
    if (data.name) {
      cy.get('#formRoles [formcontrolname=name]').clear().type(data.name);
    }
    if (data.description) {
      cy.get('#formRoles [formcontrolname=description]').clear().type(data.description);
    }

    if (save) {
      AdminGroupPage.saveGroup();
    }
  }

  static selectGroup(name: string) {
    cy.get('[data-cy=search]').clear().type(name);
    cy.get('groups-table').contains(name).click();
    // cy.get('#formRoles').should('be.visible');
  }

  static clearSearch() {
    cy.get('[data-cy=search]').clear();
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

  static deleteGroup(groupName: string, deleteConfirm: boolean = true) {
    cy.contains('.mat-table .mat-row', groupName)
      .find('button:nth-child(1) > span:nth-child(1) > mat-icon:nth-child(1)')
      .invoke('show')
      .click({ force: true });
    cy.contains('button', 'Löschen').click();
    cy.get('mat-dialog-container');
    if (deleteConfirm) {
      cy.intercept('DELETE', '/api/groups/**').as('deleteGroup');
      cy.contains('button', 'Gruppe löschen').click();
      cy.wait('@deleteGroup');
    }
  }

  static deleteGroupOfOtherUsers(groupName: string) {
    cy.contains('.mat-table .mat-row', groupName)
      .find('button:nth-child(1) > span:nth-child(1) > mat-icon:nth-child(1)')
      .invoke('show')
      .click({ force: true });
    cy.contains('button', 'Löschen').click();
    cy.get('mat-dialog-content')
      .contains(`Möchten Sie die Gruppe "${groupName}" wirklich löschen? Die Gruppe wird von einem Nutzer verwendet:`)
      .should('be.visible');
    cy.intercept('DELETE', '/api/groups/**').as('deleteRequest');
    cy.contains('button', 'Gruppe löschen').click();
    cy.wait('@deleteRequest');
  }

  static openAddDocumentsDialog(docType: string) {
    const documentType = new RegExp(docType);
    cy.contains('permission-table', documentType).find('[data-cy=add-permission]').click();
  }

  static addNestedDocumentToGroup(arrayPath: string[], docType: string) {
    this.openAddDocumentsDialog(docType);
    for (const docName of arrayPath) {
      cy.contains('mat-tree-node .label', new RegExp('^' + docName + '$')).click();
    }
    cy.intercept('GET', '/api/datasets/**').as('waitRequest');
    cy.get('mat-dialog-actions button').contains('Hinzufügen').click();
    cy.wait('@waitRequest');
  }

  static addDocumentToGroup(docName: string, docType: string) {
    this.openAddDocumentsDialog(docType);

    cy.intercept('GET', '/api/datasets/**').as('waitRequest');
    cy.contains('mat-tree-node', docName).click();
    cy.get('mat-dialog-actions button').contains('Hinzufügen').click();
    cy.wait('@waitRequest');
  }

  static tryIllegitimateAddToGroup(docName: string, docType: string) {
    this.openAddDocumentsDialog(docType);
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
