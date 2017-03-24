import {FormularService} from '../services/formular/formular.service';
import {EventManager} from '@angular/platform-browser';
import {ComponentFactoryResolver, Injectable, ViewContainerRef} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {AddControlBehaviour} from './system/demo/behaviours/AddControl/addControl.behaviour';
import {StorageService} from '../services/storage/storage.service';
import {ShowDateInSectionBehaviour} from './form/ShowDateInSection/show-date-in-section.behaviour';
import {TitleValidatorBehaviour} from './form/TitleValidator/title-validator.behaviour';
import {CreateDocRulesPlugin} from './system/CreateRules/create-rules.behaviour';
import {Plugin} from './plugin';
import {StatisticPlugin} from './system/statistic/statistic.plugin';
import {WorkflowPlugin} from './system/workflow/workflow.plugin';
import {DemoPlugin} from './system/demo/demo.plugin';
import {PublishPlugin} from './system/publish/publish.plugin';
import {MenuService} from '../menu/menu.service';
import {FormToolbarService} from '../+form/toolbar/form-toolbar.service';
import {ModalService} from '../services/modal/modal.service';
import {CopyCutPastePlugin} from "./system/CopyCutPaste/copy-cut-paste.behaviour";
import {ToastService} from '../services/toast.service';

export interface Behaviour {
  id: string;
  title: string;
  description: string;
  defaultActive: boolean;
  forProfile: string;
  isActive?: boolean;
  register: (form: FormGroup, eventManager: EventManager) => void;
  unregister: () => void;
  controls?: any[];
  outer?: any;
  _state?: string;
}

@Injectable()
export class BehavioursDefault {

  constructor(private formService: FormularService,
              private storageService: StorageService,
              private menuService: MenuService,
              private modalService: ModalService,
              private toastService: ToastService,
              private formToolbarService: FormToolbarService,
              private compFacResolver: ComponentFactoryResolver) {
  }

  /**
   * The definition of all behaviours.
   * @type {{id: string; title: string; description: string; defaultActive: boolean; outer: BehavioursDefault; register: Function}[]}
   */
  behaviours: Behaviour[] = [
    // new ClickAndChangeTitleBehaviour( this.storageService ),
    // new MapAndChangeTitleBehaviour( this.formService ),
    // new OpenDataBehaviour(this.storageService),
    new AddControlBehaviour( this.formService ),
    new ShowDateInSectionBehaviour( this.storageService ),
    new TitleValidatorBehaviour()
  ];

  systemBehaviours: Plugin[] = [
    new StatisticPlugin(this.menuService),
    new WorkflowPlugin(this.formToolbarService),
    new DemoPlugin(this.menuService),
    new PublishPlugin(this.formToolbarService, this.formService, this.modalService, this.storageService),
    new CreateDocRulesPlugin(this.formService, this.storageService),
    new CopyCutPastePlugin(this.formService, this.formToolbarService, this.storageService, this.modalService,
      this.toastService, this.compFacResolver)
  ];
}