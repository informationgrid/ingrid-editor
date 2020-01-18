# Create a new page

* create a new module under app (e.g. AddressModule)
* rename created folder "address" to "+address" to show that it's a page
* create a new component under app/+address (e.g. AddressComponent)
* create a new file "address.routing.ts" with content:
```
export const routing = RouterModule.forChild( [
  {
    path: '',
    component: AddressComponent,
    canActivate: [AuthGuard]
  }
] );
```
* put exported constant inside "import" of the module
* add item to _menuItems in MenuService
* add page to main router (app.router.ts)
* in "side-menu.component.ts" add icon definition to "mapRouteToIcon"
