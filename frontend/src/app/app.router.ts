import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './security/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./+dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard],
    data: {
      title: 'Übersicht',
      icon: 'Uebersicht'
    }
  },
  {
    path: 'form',
    loadChildren: () => import('./+form/ige-form.module').then(m => m.IgeFormModule),
    canActivate: [AuthGuard],
    data: {
      title: 'Daten',
    icon: 'Daten'
    }
  },
  {
    path: 'address',
    loadChildren: () => import('./+address/address.module').then(m => m.AddressModule),
    canActivate: [AuthGuard],
    data: {
      title: 'Adressen',
      icon: 'Adressen'
    }
  },
  {
    path: 'research',
    loadChildren: () => import('./+research/research.module').then(m => m.ResearchModule),
    data: {
      title: 'Recherche',
      icon: 'Recherche'
    }
  },
  {
    path: 'user',
    loadChildren: () => import('./+user/user.module').then(m => m.UserModule),
    data: {
      title: 'Benutzerverwaltung',
      // featureFlag: 'AP3',
      onlyAdmin: true,
      icon: 'Nutzer'
    }
  },
  // TODO: check canActivateChild: [AuthGuard],
  {
    path: 'importExport',
    loadChildren: () => import('./+importExport/import-export.module').then(m => m.ImportExportModule),
    canActivate: [AuthGuard],
    data: {
      title: 'Import / Export',
      onlyAdmin: true,
      icon: 'Im-Export'
    }
  },
  {
    path: 'catalogs',
    loadChildren: () => import('./+catalog/catalog.module').then(m => m.CatalogModule),
    data: {
      title: 'Katalogverwaltung',
      onlyAdmin: true,
      icon: 'Katalog'
    }
  },
/*  {
    path: 'plugins',
    loadChildren: () => import('./+catalog/+behaviours/behaviours.module').then(m => m.BehavioursModule),
    data: {
      title: 'Verhalten',
      onlyAdmin: true,
      icon: 'outline-star_border-24px'
    }
  },*/
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
