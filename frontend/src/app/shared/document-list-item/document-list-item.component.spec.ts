import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { DocumentListItemComponent } from './document-list-item.component';

describe('DocumentListItemComponent', () => {
  let spectator: Spectator<DocumentListItemComponent>;
  const createComponent = createComponentFactory(DocumentListItemComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
