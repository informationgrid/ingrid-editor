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
    cy.get('.start-index').click();
    cy.get('.cancel-index').should('not.exist');
    // cy.get('.main-header button').contains('Indizieren');
    // cy.get("div.status:contains('Endzeit')", { timeout: timeout }).should('exist');
  }
}
