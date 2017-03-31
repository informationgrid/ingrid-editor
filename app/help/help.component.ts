import {Component, OnInit, animate, transition, style, state, trigger} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';

@Component( {
  selector: 'help-panel',
  template: require( './help.component.html' ),
  styles: [require( './help.component.css' )],
  animations: [
    trigger( 'openClose', [
      state( 'collapsed, void', style( {transform: 'translate3d(100%, 0, 0)'} ) ),
      state( 'expanded', style( {transform: 'translate3d(0, 0, 0)', width: '300px'} ) ),
      state( 'maximized', style( {transform: 'translate3d(0, 0, 0)', width: '95%'} ) ),
      transition( 'collapsed => expanded', animate( '200ms ease-in' ) ),
      transition( '* => collapsed', animate( '200ms ease-out' ) ),
      transition( 'expanded => maximized', animate( '200ms ease-in' ) ),
      transition( 'maximized => expanded', animate( '200ms ease-out' ) )
    ] )
  ]
} )
export class HelpComponent implements OnInit {

  menuState = 'collapsed';
  text: string;
  previousPath: string;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.router.events.subscribe( (event: NavigationEnd) => {
      let url = event.url;
      if (event instanceof NavigationEnd && url.indexOf(this.previousPath) === -1) {
        console.log( 'fetch help:', url );
        this.text = url;
        this.previousPath = HelpComponent.preparePreviousPath(url);
      }
    } );
  }

  static preparePreviousPath(url: string) {
    let pos = url.indexOf('/', 1);
    return (pos > 0) ? url.substring(0, pos) : url;
  }

  toggleState() {
    this.menuState === 'collapsed' ? this.menuState = 'expanded' : this.menuState = 'collapsed';
  }

  toggleMaximized() {
    console.log( 'max' );
    this.menuState === 'maximized' ? this.menuState = 'expanded' : this.menuState = 'maximized';
  }
}
