import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { Browser } from '@capacitor/browser';
import { AuthenticationService } from '../services/authentication.service';
import { HelperService } from '../services/helper.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  generals;
  settings;
  staff;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private helper: HelperService,
    private firestore: AngularFirestore,
  ) { }

  ngOnInit() {
    this.checkUser();
    this.getSettings();
  }

  logout() {

    Storage.remove({ key: 'user' });
    Storage.remove({ key: 'staff' });

    this.router.navigate(['/login']);
  }

  async aboutUs() {

    console.log(this.settings.about_us_link);
    // this.inAppBrowser({ url: this.settings.about_us_link });
    await Browser.open({ url: this.settings.about_us_link });

  }

  async contactUs() {

    console.log(this.settings.contact_us_link);
    // this.inAppBrowser({ url: this.settings.contact_us_link });
    await Browser.open({ url: this.settings.contact_us_link });

  }

  async facebook() {

    // this.inAppBrowser({ url: this.settings.facebook });
    // await Browser.open({ url: this.settings.facebook });
    window.open(this.settings.facebook, '_system', 'location=yes');

  }

  async tiktok() {

    // this.inAppBrowser({ url: this.settings.tiktok });
    // await Browser.open({ url: this.settings.tiktok });
    window.open(this.settings.tiktok, '_system', 'location=yes');


  }

  admin() {
    this.router.navigate(['/admin']);
  }

  policy() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        // policy: this.settings.policy
      }
    };
    this.router.navigate(['/privacy-policy'], navigationExtras);
  }

  inAppBrowser(link) {

    console.log('opening');

    const openCapacitorSite = async () => {
      await Browser.open({ url: link });
    };

  }

  getSettings() {

    return this.firestore.collection('generals').doc('settings')
      .valueChanges()
      .subscribe(singleDoc => {

        console.log(singleDoc);
        this.settings = singleDoc;

        Storage.set({
          key: 'privacy_policy',
          value: this.settings.policy,
        });
      }, error => {
        console.log('getSettings errror', error);
      });
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

  async checkUser() {

    let { value }: any = await Storage.get({ key: 'staff' });
    this.staff = JSON.parse(value);
    console.log('enter staff', this.staff);

  }

  goPage(link) {
    this.router.navigate(['/admin/' + link]);
  }

}
