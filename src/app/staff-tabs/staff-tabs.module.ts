import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffTabsPageRoutingModule } from './staff-tabs-routing.module';

import { StaffTabsPage } from './staff-tabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffTabsPageRoutingModule
  ],
  declarations: [StaffTabsPage]
})
export class StaffTabsPageModule {}
