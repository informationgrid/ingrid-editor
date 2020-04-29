import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './security/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./+dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'form',
    loadChildren: () => import('./+form/ige-form.module').then(m => m.IgeFormModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'address',
    loadChildren: () => import('./+address/address.module').then(m => m.AddressModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'user',
    loadChildren: () => import('./+user/user.module').then(m => m.UserModule)
  },
  // TODO: check canActivateChild: [AuthGuard],
  {
    path: 'importExport',
    loadChildren: () => import('./+importExport/import-export.module').then(m => m.ImportExportModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'catalogs',
    loadChildren: () => import('./+catalog/catalog.module').then(m => m.CatalogModule)
  },
  {
    path: 'research',
    loadChildren: () => import('./+research/research.module').then(m => m.ResearchModule)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];

// export const appRoutingProviders: any[] = [];

export const routing = RouterModule.forRoot(
  routes, {
    preloadingStrategy: PreloadAllModules
  }
);
