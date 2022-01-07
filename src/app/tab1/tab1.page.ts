import { Component } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { AuthenticationService } from '../services/authentication.service';
import { Browser } from '@capacitor/browser';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Router, NavigationExtras } from '@angular/router';
import { DocumentViewer, DocumentViewerOptions } from '@awesome-cordova-plugins/document-viewer/ngx';
import { Capacitor } from '@capacitor/core';

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

  constructor(
    private authService: AuthenticationService,
    private callNumber: CallNumber,
    private router: Router,
    private document: DocumentViewer
  ) {
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
        console.log('staff', this.staff);
      }


    } else {

      user = JSON.parse(user);
      this.user = user;
      console.log(this.user.cust_id);

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
          console.log('cService', this.cService);

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

    console.log(copy);
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
              console.log('cPolicy', this.cPolicy);
            }
          });

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

    console.log('whatsapp');

    const ws = ["60132880013", "60132880135"];
    const random = Math.floor(Math.random() * ws.length);

    // https://api.whatsapp.com/send?phone=919756054965&amp;text=I%20want%20to%20find%20out%20about%20your%20products

    let link = 'https://api.whatsapp.com/send?phone=' + ws[random] + '&text=hi%20ape%20kabar';


    window.open(link, '_system', 'location=yes');

    // const openCapacitorSite = async () => {
    //   await Browser.open({ url: link });
    // };

  }

  call() {

    this.callNumber.callNumber("60132880013", true)
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

  downloadPDF(name, url) {

    if (Capacitor.getPlatform() === 'web') {
      window.open(url);
    } else {

      const options: DocumentViewerOptions = {
        title: name
      }

      this.document.viewDocument(url, 'application/pdf', options)

    }

  }



}
