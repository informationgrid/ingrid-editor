import {FormToolbarComponent} from "./form-toolbar.component";
import {createComponentFactory, Spectator, SpyObject} from '@ngneat/spectator';
import {DynamicDatabase} from '../sidebars/tree/tree.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatDividerModule} from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FormToolbarService, ToolbarItem} from './form-toolbar.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

let spectator: Spectator<FormToolbarComponent>;
let service: FormToolbarService;
let db: SpyObject<DynamicDatabase>;
const createHost = createComponentFactory({
  component: FormToolbarComponent,
  imports: [MatIconModule, MatDividerModule, MatButtonModule, MatMenuModule, MatToolbarModule, FlexLayoutModule, BrowserAnimationsModule]
});

describe('Form-Toolbar', () => {
  beforeEach(() => {
    spectator = createHost();
    service = spectator.get(FormToolbarService);
  });

  it('should show some toolbar items', () => {

    // trigger data binding to update the view
    spectator.detectChanges();

    // find the title element in the DOM using a CSS selector
    const buttons = spectator.queryAll('button');

    // confirm the element's content
    expect(buttons.length).toBe(2);

  });

  it('should add a toolbar item through the service', () => {
    const item: ToolbarItem = {
      id: 'btnToolbarTest', tooltip: 'TEST_TOOLBAR_ITEM', cssClasses: 'remove', pos: 1, eventId: 'TEST_EVENT'
    };
    service.addButton(item);

    spectator.detectChanges();

    // find the title element in the DOM using a CSS selector
    const buttons = spectator.queryAll('button');

    // confirm the element's content
    expect(buttons.length).toBe(3);
  });

  fit('should add a publish button through the service', () => {
    const item: ToolbarItem = {
      id: 'btnPublish', tooltip: 'TEST_TOOLBAR_ITEM', cssClasses: 'remove', pos: 100, eventId: 'TEST_EVENT',
      isPrimary: true, label: 'Veröffentlichen', align: 'right'
    };
    service.addButton(item);

    spectator.detectChanges();

    // find the title element in the DOM using a CSS selector
    const buttons = spectator.queryAll('button');

    // confirm the element's content
    expect(buttons.length).toBe(3);
  });
});
