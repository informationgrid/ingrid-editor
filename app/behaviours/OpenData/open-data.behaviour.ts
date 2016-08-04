import { Behaviour } from '../../services/behaviour/behaviours';
/**
 * OpenDataBehaviour
 */
export class OpenDataBehaviour implements Behaviour {
  id = 'open-data';
  title = 'Open Data Behaviour';
  description = '...';
  defaultActive = true;
  constructor() {

  }

  register() {
    console.log( 'open data behaviour' );
  }
}