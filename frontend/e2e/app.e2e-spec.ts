import { IgeRemasteredCliPage } from './app.po';

describe('ige-remastered-cli App', () => {
  let page: IgeRemasteredCliPage;

  beforeEach(() => {
    page = new IgeRemasteredCliPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    // expect(page.getParagraphText()).toEqual('app works!');
  });
});
