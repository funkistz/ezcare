import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  logout() {

    Storage.remove({ key: 'user' });
    Storage.remove({ key: 'staff' });

    this.router.navigate(['/login']);
  }

  aboutUs() {

    this.inAppBrowser('https://www.ezcare-warranty.com/about/');

  }

  contactUs() {

    this.inAppBrowser('https://www.ezcare-warranty.com/contactus/');

  }

  facebook() {

    this.inAppBrowser('https://www.facebook.com/ezcarewarrantyOfficial/');

  }

  inAppBrowser(link) {

    console.log('opening');

    const openCapacitorSite = async () => {
      await Browser.open({ url: link });
    };

  }

}
