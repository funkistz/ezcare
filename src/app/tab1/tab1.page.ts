import { Component } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { AuthenticationService } from '../services/authentication.service';
import { Browser } from '@capacitor/browser';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Router, NavigationExtras } from '@angular/router';
import { DocumentViewer, DocumentViewerOptions } from '@awesome-cordova-plugins/document-viewer/ngx';
import { Capacitor } from '@capacitor/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PreviewAnyFile } from '@awesome-cordova-plugins/preview-any-file/ngx';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  user;
  staff;
  cPolicy;
  policies;
  services;
  cService;
  tempService;
  slideOpts = {
    initialSlide: 0,
    speed: 200,
    autoplay: true
  };
  settings;
  mobile_service_settings;
  banners;
  serviceLoaded = false;

  constructor(
    private authService: AuthenticationService,
    private callNumber: CallNumber,
    private router: Router,
    private document: DocumentViewer,
    private firestore: AngularFirestore,
    private previewAnyFile: PreviewAnyFile,
  ) {

    this.getSettingCache();
    this.getSettings();
    this.getBanners();
  }

  ionViewDidEnter() {
    this.checkUser();
  }

  async checkUser(event = null, policy_id = null) {

    this.user = null;
    this.staff = null;

    let { value }: any = await Storage.get({ key: 'user' });
    let user = value;

    if (!user) {
      let { value }: any = await Storage.get({ key: 'staff' });
      let staff = value;

      if (staff) {
        this.staff = JSON.parse(staff);
      }


    } else {

      user = JSON.parse(user);
      this.user = user;
      console.log('user', this.user);

      if (!policy_id) {
        policy_id = this.user.cust_id;
      }

      this.getPolicies(this.user.cust_ic, event, policy_id);
    }
  }

  async getServices(policy_id, event) {

    this.authService.getServices(policy_id).subscribe(
      data => {

        if (data && data.data) {

          if (data.data.length <= 0) {

            let currentMileage = parseInt(this.cPolicy.cust_vehiclemileagecur);
            let dateActivated = new Date(this.cPolicy.cust_dateactivated);

            this.cPolicy;
            this.tempService = {
              next_due_mileage_semi: currentMileage + 7000,
              next_due_mileage_fully: currentMileage + 10000,
              next_due_mileage_atf: currentMileage + 30000,
              next_due_date_semi: this.addMonths(dateActivated, 4),
              next_due_date_fully: this.addMonths(dateActivated, 6),
              next_due_date_atf: this.addMonths(dateActivated, 12),
            }

          }


          if (event) {
            event.target.complete();
          }

          let services = data.data;
          this.cService = services[services.length - 1];

        }
      }, error => {
        console.log(error);
        if (event) {
          event.target.complete();
        }
      });

  }

  addMonths(date, months) {

    let copy = new Date(date.getTime());
    let d = copy.getDate();
    copy.setMonth(copy.getMonth() + +months);
    if (copy.getDate() != d) {
      copy.setDate(0);
    }

    return copy;
  }

  async getPolicies(cust_ic, event, policy_id = null) {

    this.authService.getPoliciesByIC(cust_ic).subscribe(
      data => {

        if (data && data.data) {

          if (event) {
            event.target.complete();
          }

          this.policies = data.data;
          this.policies.forEach(poli => {
            if (poli.id == policy_id) {
              this.cPolicy = poli;
            }
          });

          console.log('policies', this.policies);

          this.getServices(policy_id, event);

        }
      }, error => {
        console.log(error);
        if (event) {
          event.target.complete();
        }
      });

  }

  async doRefresh(event) {
    await this.checkUser(event);
  }

  changeCar(event) {

    this.cPolicy = null;
    console.log(event.detail.value);
    this.checkUser(null, event.detail.value);

  }

  whatsapp() {

    const ws = this.settings.whatsapp;
    const random = Math.floor(Math.random() * ws.length);

    const wsTemplate = this.settings.whatsapp_template;

    // https://api.whatsapp.com/send?phone=919756054965&amp;text=I%20want%20to%20find%20out%20about%20your%20products

    let link = 'https://api.whatsapp.com/send?phone=' + ws[random] + '&text=' + wsTemplate;


    window.open(link, '_system', 'location=yes');

    // const openCapacitorSite = async () => {
    //   await Browser.open({ url: link });
    // };

  }

  call() {

    const call = this.settings.generals_phones;
    const random = Math.floor(Math.random() * call.length);

    console.log('calling ', call[random]);

    this.callNumber.callNumber(call[random], true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));

  }

  goLog() {
    this.router.navigate(['/tabs/staff-log']);
  }

  goService() {
    this.router.navigate(['/tabs/staff-services']);
  }

  goClaim() {
    this.router.navigate(['/tabs/staffClaims']);
  }

  async downloadPDF(name, url) {

    if (Capacitor.getPlatform() === 'web') {
      window.open(url);
    } else {

      this.previewAnyFile.previewPath(url).subscribe(
        doc => {

        }, error => {
          console.log(error);
        }
      )

      // const options: DocumentViewerOptions = {
      //   title: name
      // }

      // this.document.viewDocument(url, 'application/pdf', options)

    }

  }

  async getSettingCache() {

    let { value }: any = await Storage.get({ key: 'settings' });
    this.settings = JSON.parse(value);
  }

  getSettings() {

    this.firestore.collection('generals').doc('settings')
      .valueChanges()
      .subscribe(singleDoc => {

        this.settings = singleDoc;

        Storage.set({
          key: 'settings',
          value: JSON.stringify(this.settings),
        });
      }, error => {
        console.log(error);
      });

    this.firestore.collection('generals').doc('mobile-service')
      .valueChanges()
      .subscribe(singleDoc => {

        this.mobile_service_settings = singleDoc;

        Storage.set({
          key: 'mobile_service_settings',
          value: JSON.stringify(this.mobile_service_settings),
        });
      }, error => {
        console.log(error);
      });
  }

  getBanners() {

    this.authService.getBanners(0).subscribe(
      (data: any) => {

        if (data && data.data) {

          console.log('is same', this.banners != data.data);

          if (this.banners != data.data) {
            console.log('reassign banner');
            this.banners = data.data;
          }
        }

      }, error => {
        console.log('error', error);
      });

  }

  externalLink(link) {
    if (link) {
      window.open(link, '_system', 'location=yes');
    }
  }

}
