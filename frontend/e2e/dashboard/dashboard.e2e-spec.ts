import {DashboardPage} from "./dashboard.po";

describe('Dashboard', () => {
  let page: DashboardPage;

  beforeEach(() => {
    page = new DashboardPage();
  });

  xit('should show recent docs', () => {
    page.navigateTo();
    expect(page.getRecentDocsTitle()).toEqual('Letzte Dokumente');
  });

  it('should show shortcuts to actions', () => {
    page.navigateTo();
    expect(page.getActions().getText()).toEqual(['Neues Dokument erstellen', 'Adresse erstellen']);
  });
});
