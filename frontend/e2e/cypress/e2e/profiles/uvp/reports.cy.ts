import { Menu } from '../../../pages/menu';
import { UVPmetrics, UvpDocumentPage, UVPreports } from '../../../pages/uvpDocument.page';
import { ResearchPage } from '../../../pages/research.page';
import { Utils } from '../../../pages/utils';
import { fieldsForDownloadEntry } from '../../../pages/document.page';
import { BasePage } from '../../../pages/base.page';
import { Tree } from '../../../pages/tree.partial';

describe('uvp reports', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('uvpcatalog').as('tokens');
    UvpDocumentPage.visit();
  });
  it('should filter uvp metrics for negative pre-audits according to decision date', () => {
    Menu.switchTo('REPORTS');
    UvpDocumentPage.goToTabmenu(UVPreports.Report);
    UvpDocumentPage.getUVPmetrics(UVPmetrics.negativeAudit).then(oldValue => {
      // filter by decision date
      ResearchPage.setDate('start', '30.09.2022');
      cy.wait(2000);
      UvpDocumentPage.getUVPmetrics(UVPmetrics.negativeAudit).then(newValue => {
        expect(newValue).to.be.lessThan(oldValue);
      });
    });
  });

  it('should not go to dashboard page when reloading report page (#3790)', () => {
    Menu.switchTo('REPORTS');
    cy.contains('.page-title', 'Statistik', { timeout: 8000 }).should('exist');
    cy.reload();
    cy.url().should('include', '/reports');
  });

  it('should update display of negative pre-audits after creating new document of type Negative Vorprüfung', () => {
    const docTitle = 'N' + Utils.randomString();

    Menu.switchTo('REPORTS');
    UvpDocumentPage.goToTabmenu(UVPreports.Report);
    UvpDocumentPage.getUVPmetrics(UVPmetrics.negativeAudit).then(oldValue => {
      // create new published document of type "negative Vorprüfung"
      UvpDocumentPage.CreateNegativePreauditDocumentWithAPI(docTitle, true);
      cy.pageReload('.page-title', ' UVP Bericht');
      UvpDocumentPage.getUVPmetrics(UVPmetrics.negativeAudit).then(newValue => {
        expect(newValue).to.be.greaterThan(oldValue);
      });
    });
  });

  it('should update display of uvp numbers after creating new document of type Linienbestimmung', () => {
    const docTitle = 'L' + Utils.randomString();

    UvpDocumentPage.CreateLinienbestimmungdocumentWithAPI(docTitle, true);
    Menu.switchTo('REPORTS');
    UvpDocumentPage.goToTabmenu(UVPreports.Report);
    UvpDocumentPage.getUVPNumbermetrics('UVPG-1.4.1.2').then(oldValue => {
      // create new published document of type "Linienbestimmungsverfahren"
      UvpDocumentPage.CreateLinienbestimmungdocumentWithAPI(docTitle, true);
      cy.pageReload('.page-title', ' UVP Bericht');
      cy.contains('[label="Verwendete UVP Nummern"] .mat-row', 'UVPG-1.4.1.2')
        .children()
        .last()
        .then(node => {
          expect(parseInt(node.text().trim())).to.be.greaterThan(oldValue);
        });
    });
  });

  it('should update display of process duration after creating complete document with all procedure steps', () => {
    const docTitle_1 = 'R' + Utils.randomString();
    const docTitle_2 = 'R' + Utils.randomString();

    UvpDocumentPage.CreateRaumordnungverfahrenDocumentWithAPI(
      docTitle_1,
      '2018-11-05T23:00:00.000Z',
      '2021-11-05T23:00:00.000Z'
    );
    //Menu.switchTo('REPORTS');
    cy.visit('reports/general');
    UvpDocumentPage.goToTabmenu(UVPreports.Report);
    UvpDocumentPage.getUVPmetrics(UVPmetrics.averageProcessLength).then(oldValue => {
      // create new document of type "negative Vorprüfung"
      UvpDocumentPage.CreateRaumordnungverfahrenDocumentWithAPI(
        docTitle_2,
        '2020-11-05T23:00:00.000Z',
        '2022-03-18T23:00:00.000Z',
        true
      );
      cy.pageReload('[label="Kennzahlen"] tbody[role="rowgroup"]');
      UvpDocumentPage.getUVPmetrics(UVPmetrics.averageProcessLength).then(newValue => {
        expect(newValue).to.be.equal(oldValue);
      });
    });
  });

  it('should update display of positive pre-audits after creating a new document of type Zulassungsverfahren', () => {
    const docTitle = 'Z' + Utils.randomString();

    UvpDocumentPage.CreateZulassungsverfahrenDocumentWithAPI('Z_13');
    Menu.switchTo('REPORTS');
    UvpDocumentPage.goToTabmenu(UVPreports.Report);
    UvpDocumentPage.getUVPmetrics(UVPmetrics.positiveAudit).then(oldValue => {
      // create new document of type "negative Vorprüfung"
      UvpDocumentPage.CreateZulassungsverfahrenDocumentWithAPI(docTitle, true);
      cy.pageReload('[label="Kennzahlen"] tbody[role="rowgroup"]');
      UvpDocumentPage.getUVPmetrics(UVPmetrics.positiveAudit).then(newValue => {
        expect(newValue).to.be.greaterThan(oldValue);
      });
    });
  });

  it('should save metrics to file', () => {
    Menu.switchTo('REPORTS');
    UvpDocumentPage.goToTabmenu(UVPreports.Report);
    UvpDocumentPage.getAllValues().then(arr1 => {
      UvpDocumentPage.downloadReport();
      UvpDocumentPage.getReportFromFile().then(arr2 => {
        // compare the content of the two arrays
        expect(arr2).to.deep.eq(arr1);
      });
    });
  });

  it('should execute validation of urls in published documents', () => {
    Menu.switchTo('REPORTS');
    UvpDocumentPage.goToTabmenu(UVPreports.URLmanagement);

    // trigger validation and make sure it concludes with a result
    cy.contains('button', 'Prüfung starten').click();
    cy.contains('.main-header span', 'Laufende Prüfung').should('exist');
    cy.get('mat-progress-spinner circle', { timeout: 60000 }).should('not.exist');

    // inspect details of validation and compare numbers of valid and invalid urls
    cy.get('.main-header .menu-button').click();
    cy.get('.status').should('be.visible');
    UvpDocumentPage.getNumberOfAnalysedURLs().then(total => {
      UvpDocumentPage.getNumberOfInvalidURLs().should('be.lessThan', total);
    });

    // table should contain different sorts of invalid urls
    cy.contains('.status-column', 'NotFound').should('exist');
    cy.contains('.status-column', 'Unauthorized').should('exist');
    cy.contains('.status-column', 'InternalServerError').should('exist');
    cy.contains('.status-column', 'Forbidden').should('exist');

    // check if link would be opened in new tab
    cy.get('.mat-cell a')
      .first()
      .should('have.attr', 'target', '_blank')
      .then(link => {
        cy.request({ url: link.prop('href'), failOnStatusCode: false })
          .its('status')
          .should('not.eq', 200);
      });

    // check if click on document opens document
    cy.contains('.mat-column-datasets', 'Plan_R_I').click();
    cy.url().should('contain', '/form');
    cy.contains('.title', 'Plan_R_I');
  });

  it('should indicate error when replacing url with new invalid url', () => {
    Menu.switchTo('REPORTS');
    UvpDocumentPage.goToTabmenu(UVPreports.URLmanagement);
    UvpDocumentPage.replaceURL('http://192.168.0.226:3001/not_found2', 'https://cypress.io/dash');
    BasePage.checkErrorDialogMessage('Prüfung der URL lieferte einen Fehler');
  });

  it('should successfully replace old url with new valid url', () => {
    const urlToBeReplaced = 'http://192.168.0.226:3001/not_found1';
    const newURL = 'https://www.cypress.io';

    Menu.switchTo('REPORTS');
    UvpDocumentPage.goToTabmenu(UVPreports.URLmanagement);
    UvpDocumentPage.replaceURL(urlToBeReplaced, newURL);

    // make sure url has been replaced
    cy.contains('.mat-table .mat-row', urlToBeReplaced).should('not.exist');
  });

  it('should indicate error when trying to replace obsolete url', () => {
    const url = 'http://192.168.0.226:3001/server_error';
    const newURL = 'https://notthat.com';

    Menu.switchTo('REPORTS');
    UvpDocumentPage.goToTabmenu(UVPreports.URLmanagement);

    // replace url in document without restarting validation
    cy.contains('.mat-table .mat-row', url).find('.clickable-text').click();
    cy.url().should('contain', '/form');
    UvpDocumentPage.editRowInDownloadTable('Auslegungsinformationen-table', url, 'Bearbeiten');
    UvpDocumentPage.editDownloadTableEntry(fieldsForDownloadEntry.Link, newURL);

    // publish document
    UvpDocumentPage.publishNow();

    // go back to reports section
    Menu.switchTo('REPORTS');
    UvpDocumentPage.goToTabmenu(UVPreports.URLmanagement);
    UvpDocumentPage.replaceURL(url, newURL);
    cy.contains('error-dialog', /zu ersetzende URL konnte nicht gefunden werden/);
  });

  it('should show documents that have invalid url in common', () => {
    const url = 'http://192.168.0.226:3001/users';
    let docs: string[] = [];

    Menu.switchTo('REPORTS');
    UvpDocumentPage.goToTabmenu(UVPreports.URLmanagement);

    // click on 'eye'-symbol
    cy.contains('.mat-table .mat-row', url).find('[mattooltip="Datensätze anzeigen"]').click();
    cy.get('ige-list-datasets-dialog').should('exist');
    // collect document names, then open documents and check for url
    cy.get('mat-action-list button')
      .each(element => {
        docs.push(element.text().trim());
      })
      .then(_ => {
        UvpDocumentPage.visit();
        docs.forEach(node => {
          Tree.openNode(['Plan_Ordner_1', 'Plan_Ordner_2', node]);
          cy.contains('mat-row a', url).should('exist');
        });
      });
  });

  it('should be able to deal with invalid urls that constitute a bad request (#4173)', () => {
    // publish document with problematic url
    Tree.openNode(['Plan_Ordner_1', 'Plan_Ordner_2', 'Plan_Z_III']);
    UvpDocumentPage.publishNow();

    // make sure url validation is executed and ended
    Menu.switchTo('REPORTS');
    UvpDocumentPage.goToTabmenu(UVPreports.URLmanagement);
    cy.contains('button', 'Prüfung starten').click();
    cy.contains('.main-header span', 'Laufende Prüfung').should('exist');
    cy.get('mat-progress-spinner circle', { timeout: 15000 }).should('not.exist');
  });
});
