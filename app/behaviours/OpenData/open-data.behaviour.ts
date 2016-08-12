import { Behaviour } from '../../services/behaviour/behaviours';
import {BaseBehaviour} from '../base.behaviour';
/**
 * OpenDataBehaviour
 */
export class OpenDataBehaviour extends BaseBehaviour implements Behaviour {
  id = 'open-data';
  title = 'Open Data Behaviour';
  description = '...';
  defaultActive = true;
  forProfile = 'UVP';

  constructor() {
    super();
  }

  register() {
    console.log( 'open data behaviour' );
  }
}