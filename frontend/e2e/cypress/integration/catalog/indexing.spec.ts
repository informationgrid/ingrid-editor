import { BehavioursPage } from '../../pages/behaviours.page';
import { CatalogsTabmenu } from '../../pages/base.page';
import {AddressPage} from "../../pages/address.page";
import {DocumentPage} from "../../pages/document.page";

describe('Indexing', () => {
  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('catalogs');
  });

  afterEach(() => {
    cy.kcLogout();
  });

  it('Index and check indexed object counter has increased', () => {
    const json = {
      firstName: 'vor',
      lastName: 'nach',
      organization: 'org',
      title: 'APICall-forINDEX',
      _type: 'AddressDoc',
      contact: [{ type: 1, connection: '0123456789' }]
    };

    AddressPage.apiCreateAddress(json, true);

    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);
    BehavioursPage.openIndexStatusBox();

    cy.get('button').contains('Indizieren').click();
    DocumentPage.waitUntilElementIsVisible("div.status:contains('Endzeit')");

    cy.get('div.status').should('not.contain', 'Anzahl Adressen: 0');

  })

  it('Set a cron expression and check', () => {
    const cron = '*/30 * * * * *';
    const json = {
      firstName: 'vor',
      lastName: 'nach',
      organization: 'org',
      title: 'APICall-forcronINDEX',
      _type: 'AddressDoc',
      contact: [{ type: 1, connection: '0123456789' }]
    };

    AddressPage.apiCreateAddress(json, true);

    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);
    BehavioursPage.openIndexStatusBox();
    cy.get('mat-form-field input').clear().type(cron);

    cy.get('mat-hint').contains('Alle 30 Sekunden');

    cy.get('button').contains('Übernehmen').click();
    DocumentPage.waitUntilElementIsVisible("div.status:contains('Endzeit')");

    cy.get('button').contains('Keine zeitliche Indizierung').click();
  });

  it('Set cron expression via example buttons', () => {
    const json = {
      firstName: 'vor',
      lastName: 'nach',
      organization: 'org',
      title: 'APICall-forcronexampleINDEX',
      _type: 'AddressDoc',
      contact: [{ type: 1, connection: '0123456789' }]
    };

    AddressPage.apiCreateAddress(json, true);

    BehavioursPage.openCatalogSettingsTab(CatalogsTabmenu.Indizierung);

    cy.get('mat-chip').contains('Alle 30 Minuten').click();

    cy.get('mat-hint').contains('Alle 30 Minuten');
  });

});
