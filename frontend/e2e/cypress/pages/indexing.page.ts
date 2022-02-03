export enum StatusContent {
  countDocuments,
  countAddresses,
  startTime,
  endTime
}

export class IndexingPage {
  static getStatusContent(part?: StatusContent) {
    const status = cy.get('div.status');
    if (part) status.contains(this.mapStatusContent(part));
    return status.invoke('text');
  }

  private static mapStatusContent(part: StatusContent): string {
    switch (part) {
      case StatusContent.countDocuments:
        return 'Anzahl Dokumente';
      case StatusContent.countAddresses:
        return 'Anzahl Adressen';
      case StatusContent.startTime:
        return 'Startzeit';
      case StatusContent.endTime:
        return 'Endzeit';
    }
  }

  static indexAndWait(timeout = 30000) {
    cy.intercept('POST', '/api/index').as('indexRequest');
    cy.get('.start-index').click();
    cy.get('.cancel-index', { timeout: timeout }).should('not.exist');
    cy.wait('@indexRequest');
  }

  static openIndexStatusBox() {
    cy.get('div.header [data-mat-icon-type=font]').click();
    cy.get('div.status').should('be.visible');
  }
}
