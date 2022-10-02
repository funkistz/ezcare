import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Storage } from '@capacitor/storage';
import { Router, NavigationExtras } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  user;
  cPolicy;
  policies;
  services;
  engineServices = [];
  atfServices = [];
  cService;
  isLoading = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {

    this.checkUser();
  }

  ionViewDidEnter() {
    this.checkUser();
  }

  async checkUser(event = null, policy_id = null) {
    let { value }: any = await Storage.get({ key: 'user' });
    // console.log(value);
    value = JSON.parse(value);
    this.user = value;
    // console.log(this.user.cust_id);

    if (!policy_id) {
      policy_id = this.user.cust_id;
    }

    this.getPolicies(this.user.cust_ic, event, policy_id);
    this.getServices(policy_id, event);
  }

  async getServices(policy_id, event) {

    this.isLoading = true;

    // this.services = null;
    // this.cService = null;

    this.authService.getServices(policy_id).subscribe(
      data => {

        this.isLoading = false;

        if (data && data.data) {

          console.log('servicess', data);

          if (event) {
            event.target.complete();
          }

          this.services = data.data;
          this.cService = this.services[this.services.length - 1];

          this.engineServices = [];
          this.atfServices = [];

          this.services.forEach(service => {

            if (service.next_due_date_atf) {
              service.next_due_date_atf = moment(service.next_due_date_atf, 'YYYY-MM-DD').toDate();
            } else if (service.next_due_date) {
              service.next_due_date = moment(service.next_due_date, 'YYYY-MM-DD').toDate();
            }

            if (service.service_type_id == 1) {

              this.engineServices.push(service);

            } else if (service.service_type_id == 2) {

              this.atfServices.push(service);

            }


          });

        }
      }, error => {
        this.isLoading = false;
        console.log(error);
        if (event) {
          event.target.complete();
        }
      });

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

  addService(policy_id) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        policy_id: policy_id,
        policy: JSON.stringify(this.cPolicy),
      }
    };
    this.router.navigate(['/tabs/tab2/add-service'], navigationExtras)
  }

  changeCar(event) {

    this.cPolicy = null;
    console.log(event.detail.value);
    this.checkUser(null, event.detail.value);

  }

  viewService(service_id) {

    console.log(service_id);

    let navigationExtras: NavigationExtras = {
      queryParams: {
        service_id: service_id
      }
    };
    this.router.navigate(['/tabs/tab2/view-service'], navigationExtras)

  }

}
