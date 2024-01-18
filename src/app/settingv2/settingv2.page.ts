import { Component, OnInit } from '@angular/core';
import { Apiv2Service } from '../services/apiv2.service';
import { Preferences } from '@capacitor/preferences';
import { Router, NavigationExtras } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-settingv2',
  templateUrl: './settingv2.page.html',
  styleUrls: ['./settingv2.page.scss'],
})
export class Settingv2Page implements OnInit {

  settings;
  settingsOld;

  constructor(
    private apiv2: Apiv2Service,
    private router: Router,
    private firestore: AngularFirestore,
  ) { }

  ngOnInit() {
    this.getSettingsV2();
    this.getSettings();
  }

  async aboutUs() {

    console.log(this.settings.about_us_link);
    // this.inAppBrowser({ url: this.settings.about_us_link });
    await Browser.open({ url: this.settings.m_about_us_link.value });

  }

  async contactUs() {

    console.log(this.settings.contact_us_link);
    // this.inAppBrowser({ url: this.settings.contact_us_link });
    await Browser.open({ url: this.settings.m_contact_us_link.value });

  }

  async facebook() {

    // this.inAppBrowser({ url: this.settings.facebook });
    // await Browser.open({ url: this.settings.facebook });
    window.open(this.settings.m_facebook_link.value, '_system', 'location=yes');

  }

  async tiktok() {

    // this.inAppBrowser({ url: this.settings.tiktok });
    // await Browser.open({ url: this.settings.tiktok });
    window.open(this.settings.m_tiktok_link.value, '_system', 'location=yes');


  }

  policy() {
    this.router.navigate(['/privacy-policy']);
  }

  async getSettingsV2() {

    this.apiv2.get('mobile/settings', {}).subscribe(
      data => {
        console.log('getSettingsV2', data);

        Preferences.set({
          key: 'settings_v2',
          value: JSON.stringify(data.data),
        });
        this.settings = data.data;

      }, error => {

      });

    return;

  }

  getSettings() {

    return this.firestore.collection('generals').doc('settings')
      .valueChanges()
      .subscribe(singleDoc => {

        console.log(singleDoc);
        this.settingsOld = singleDoc;

        Preferences.set({
          key: 'privacy_policy',
          value: this.settingsOld.policy,
        });
      }, error => {
        console.log('getSettings errror', error);
      });
  }

  logout() {

    Preferences.remove({ key: 'user' });
    Preferences.remove({ key: 'staff' });

    this.router.navigate(['/loginv2']);
  }

}
