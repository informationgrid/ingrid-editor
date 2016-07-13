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
        behaviour.register.call( this.defaultBehaves, form );
      }
    } );
  }

  enable(id: string, form: FormGroup) {
    this.behaviours.some( behaviour => {
      if (behaviour.id === id) {
        behaviour.register.call( this.defaultBehaves, form );
        return true;
      }
    });
  }

  disable(id: string) {
    this.behaviours.some( behaviour => {
      if (behaviour.id === id) {
        behaviour.unregister.call( this.defaultBehaves );
        return true;
      }
    });
  }
}
