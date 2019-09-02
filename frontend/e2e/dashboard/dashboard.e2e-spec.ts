import {DashboardPage} from './dashboard.po';

describe('Dashboard', () => {
  let page: DashboardPage;

  beforeEach(() => {
    page = new DashboardPage();
  });

  xit('should show recent docs', () => {
    page.navigateTo();
    // expect(page.getRecentDocsTitle()).toEqual('Letzte Dokumente');
  });

  it('should show shortcuts to actions', async() => {
    page.navigateTo();

    const actions = await page.getActions().getText();
    expect(actions).toEqual(['Neues Dokument', 'Neue Adresse', 'Neuen Benutzer anlegen']);
  });
});
