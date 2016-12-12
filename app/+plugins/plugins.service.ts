import { Injectable } from '@angular/core';
import {StatisticPlugin, WorkflowPlugin, DemoPlugin} from './index';
import {Plugin} from './plugin';
import {PublishPlugin} from "./publish/publish.plugin";
import {CreateDocRulesPlugin} from "./CreateRules/create-rules.behaviour";

@Injectable()
export class PluginsService {

    constructor(private statPlugin: StatisticPlugin, private workflowPlugin: WorkflowPlugin,
                private demoPlugin: DemoPlugin, private publishPlugin: PublishPlugin,
      private newDocRules: CreateDocRulesPlugin) { }

    // TODO: merge plugins with external configuration with active state
    getPlugins(): Plugin[] {
      return [
        this.statPlugin,
        this.workflowPlugin,
        this.demoPlugin,
        this.publishPlugin,
        this.newDocRules
      ];
    }

}