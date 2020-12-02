import { createHorde, species, strategies } from 'gremlins.js';

xdescribe('Gremlin Tests', () => {
  let horde: any;
  let clickHorde: any;
  let mixedHorde: any;
  let testHorde: any;

  beforeEach(() => {
    cy.kcLogin('user');
    cy.visit('form');

    cy.window().then(testedWindow => {
      horde = createHorde({ window: testedWindow });
      mixedHorde = createHorde({ window: testedWindow, species: [species.toucher(), species.formFiller()] });
      clickHorde = createHorde({ window: testedWindow, species: [species.clicker()] });

      testHorde = createHorde({
        window: testedWindow,
        species: [
          species.formFiller(), // fills forms by entering data, selecting options, clicking checkboxes, etc
          species.clicker(), // clicks anywhere on the visible area of the document
          species.toucher(), // touches anywhere on the visible area of the document
          species.typer(), // types keys on the keyboard
          species.scroller() // scrolls the viewport to reveal another part of the document
        ],
        strategies: [strategies.allTogether({ nb: 100000 })]
      });
    });
  });

  afterEach(() => {
    cy.kcLogout();
  });

  describe('skip until it works: Basic Monkey Test', () => {
    xit('should unleash a army of specialized gremlins ready to mess up', () => {
      // after 10 errors, Gizmo will stop the tests automatically
      cy.wrap(horde.unleash(), { timeout: 60000 }).then(() => {
        cy.get('error-dialog').should('not.be.visible');
      });
    });

    xit('should unleash a mixed army of gremlins', () => {
      cy.wrap(mixedHorde.unleash(), { timeout: 60000 }).then(() => {
        cy.get('error-dialog').should('not.be.visible');
      });
    });

    xit('should unleash a clicking army of gremlins', () => {
      cy.wrap(clickHorde.unleash(), { timeout: 60000 }).then(() => {
        cy.get('error-dialog').should('not.be.visible');
      });
    });

    xit('should unleash a customized army of gremlins', () => {
      cy.wrap(testHorde.unleash(), { timeout: 60000 }).then(() => {
        cy.get('error-dialog').should('not.be.visible');
      });
    });

    xit('Execute code before unleash gremlins', () => {});
  });
});
