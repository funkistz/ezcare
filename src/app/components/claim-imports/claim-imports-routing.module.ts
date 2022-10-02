import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClaimImportsPage } from './claim-imports.page';

const routes: Routes = [
  {
    path: '',
    component: ClaimImportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClaimImportsPageRoutingModule {}
