import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-staff-tabs',
  templateUrl: './staff-tabs.page.html',
  styleUrls: ['./staff-tabs.page.scss'],
})
export class StaffTabsPage implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('enter staff tabs');
  }

}
