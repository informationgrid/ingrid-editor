import { Subscription } from 'rxjs';

export abstract class BaseBehaviour {
  private listeners: Function[] = [];
  private subscribers: Subscription[] = [];

  public addListener(listener: Function) {
    console.log( 'add listener' );
    this.listeners.push( listener );
  };

  public addSubscriber(subscriber: Subscription) {
    console.log( 'add subscriber' );
    this.subscribers.push( subscriber );
  }

  unregister() {
    this.listeners.forEach( l => l() );
    this.subscribers.forEach( s => s.unsubscribe() );
  }
}
