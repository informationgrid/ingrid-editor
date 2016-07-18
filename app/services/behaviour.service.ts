import {Injectable} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {BehavioursDefault, Behaviour} from "./behaviours";

@Injectable()
export class BehaviourService {

  behaviours: Behaviour[];

  constructor(private defaultBehaves: BehavioursDefault) {
    //eval(require( 'raw!./behaviours.js' ));
    this.behaviours = defaultBehaves.behaviours;
  }

  apply(form: FormGroup) {

    // possible updates see comment from kara: https://github.com/angular/angular/issues/9716

    this.behaviours.forEach( behaviour => {
      if (!behaviour.title) return;

      if (behaviour.defaultActive) {
        // we need to run code in this context
        // TODO: add parameters for behaviour
        behaviour.register( form );
      }
    } );
  }

  enable(id: string, form: FormGroup) {
    this.behaviours.some( behaviour => {
      if (behaviour.id === id) {
        behaviour.register( form );
        return true;
      }
    });
  }

  disable(id: string) {
    this.defaultBehaves.unregister( id );
  }
}
