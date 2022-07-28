import { Menu } from '../../../pages/menu';
import { UVPmetrics, uvpPage, UVPreports } from '../../../pages/uvp.page';
import { ResearchPage } from '../../../pages/research.page';
import { Utils } from '../../../pages/utils';
import { DocumentPage } from '../../../pages/document.page';

describe('uvp reports', () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin('uvpcatalog').as('tokens');
    DocumentPage.visit();
  });
  it('should filter uvp metrics for negative pre-audits according to decision date', () => {
    Menu.switchTo('REPORTS');
    uvpPage.goToTabmenu(UVPreports.Report);
    uvpPage.getUVPmetrics(UVPmetrics.negativeAudit).then(oldValue => {
      // filter by decision date
      ResearchPage.setDate('start', '30.09.2022');
      cy.wait(2000);
      cy.get(
        `[label="Kennzahlen"] tbody[role="rowgroup"] :nth-child(${UVPmetrics.negativeAudit}) :nth-child(${UVPmetrics.negativeAudit})`
      ).then(node => {
        expect(parseInt(node.text().trim())).to.be.lessThan(oldValue);
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
    uvpPage.goToTabmenu(UVPreports.Report);
    uvpPage.getUVPmetrics(UVPmetrics.negativeAudit).then(oldValue => {
      // create new document of type "negative Vorprüfung"
      DocumentPage.CreateNegativePreauditDocumentWithAPI(docTitle);
      cy.reload();
      cy.get(
        `[label="Kennzahlen"] tbody[role="rowgroup"] :nth-child(${UVPmetrics.negativeAudit}) :nth-child(${UVPmetrics.negativeAudit})`
      ).then(node => {
        expect(parseInt(node.text().trim())).to.be.greaterThan(oldValue);
      });
    });
  });

  it('should update display of uvp numbers after creating new document of type Linienbestimmung', () => {
    const docTitle = 'L' + Utils.randomString();

    DocumentPage.CreateLinienbestimmungdocumentWithAPI(docTitle);
    Menu.switchTo('REPORTS');
    uvpPage.goToTabmenu(UVPreports.Report);
    uvpPage.getUVPNumbermetrics('UVPG-1.4.1.2').then(oldValue => {
      // create new document of type "Linienbestimmungsverfahren"
      DocumentPage.CreateLinienbestimmungdocumentWithAPI(docTitle);
      cy.reload();
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

    DocumentPage.CreateRaumordnungverfahrenDocumentWithAPI(
      docTitle_1,
      '2018-11-05T23:00:00.000Z',
      '2021-11-05T23:00:00.000Z'
    );
    Menu.switchTo('REPORTS');
    uvpPage.goToTabmenu(UVPreports.Report);
    uvpPage.getUVPmetrics(UVPmetrics.averageProcessLength).then(oldValue => {
      // create new document of type "negative Vorprüfung"
      DocumentPage.CreateRaumordnungverfahrenDocumentWithAPI(docTitle_2);
      cy.pageReload('[label="Kennzahlen"] tbody[role="rowgroup"]');
      cy.get(
        `[label="Kennzahlen"] tbody[role="rowgroup"] :nth-child(${UVPmetrics.averageProcessLength}) :nth-child(2)`
      ).then(node => {
        expect(node.text().trim()).not.to.be.equal(oldValue);
      });
    });
  });

  it('should update display of positive pre-audits after creating a new document of type Zulassungsverfahren', () => {
    const docTitle = 'Z' + Utils.randomString();

    DocumentPage.CreateZulassungsverfahrenDocumentWithAPI('Z_13');
    Menu.switchTo('REPORTS');
    uvpPage.goToTabmenu(UVPreports.Report);
    uvpPage.getUVPmetrics(UVPmetrics.positiveAudit).then(oldValue => {
      // create new document of type "negative Vorprüfung"
      DocumentPage.CreateZulassungsverfahrenDocumentWithAPI(docTitle);
      cy.pageReload('[label="Kennzahlen"] tbody[role="rowgroup"]');
      cy.get(`[label="Kennzahlen"] tbody[role="rowgroup"] :nth-child(${UVPmetrics.positiveAudit}) :nth-child(2)`).then(
        node => {
          expect(parseInt(node.text().trim())).to.be.greaterThan(oldValue);
        }
      );
    });
  });

  it('should save metrics to file', () => {
    Menu.switchTo('REPORTS');
    uvpPage.goToTabmenu(UVPreports.Report);
    uvpPage.getAllValues().then(arr1 => {
      uvpPage.downloadReport();
      uvpPage.getReportFromFile().then(arr2 => {
        // compare the content of the two arrays
        expect(arr2).to.deep.eq(arr1);
      });
    });
  });
});
