import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { Browser } from '@capacitor/browser';
import { AuthenticationService } from '../services/authentication.service';
import { HelperService } from '../services/helper.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  generals;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private helper: HelperService,
  ) { }

  ngOnInit() {
    this.getGenerals();
  }

  logout() {

    Storage.remove({ key: 'user' });
    Storage.remove({ key: 'staff' });

    this.router.navigate(['/login']);
  }

  aboutUs() {

    console.log(this.generals.about_us_link);
    this.inAppBrowser(this.generals.about_us_link);

  }

  contactUs() {

    console.log(this.generals.contact_us_link);
    this.inAppBrowser(this.generals.contact_us_link);

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

  getGenerals() {

    this.authService.getSettings().subscribe(
      data => {

        if (data && data.data) {
          this.generals = data.data[0];
        }

        console.log(data);
      }, error => {
        console.log(error);
      });

  }

}
