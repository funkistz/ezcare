import { Component, ViewChild, ElementRef } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { AuthenticationService } from '../services/authentication.service';
import { Browser } from '@capacitor/browser';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Router, NavigationExtras } from '@angular/router';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as moment from 'moment';

@Component({
  selector: 'app-staff-home',
  templateUrl: './staff-home.page.html',
  styleUrls: ['./staff-home.page.scss'],
})
export class StaffHomePage {

  @ViewChild('barCanvas') private barCanvas: ElementRef;
  @ViewChild('barCanvas2') private barCanvas2: ElementRef;
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

  barChart: any;
  barChart2: any;
  reports;
  reportsYearly;

  inspectionReports = {
    pending: 0,
    approved: 0,
    rejected: 0,
  }

  reportYear;
  reportMonth;
  reportMonth2;
  years = [];
  months = ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  months2 = [];
  staffs;
  userReport;
  banners;

  constructor(
    private authService: AuthenticationService,
    private callNumber: CallNumber,
    private router: Router,
    private firestore: AngularFirestore,
  ) {
  }

  ionViewDidEnter() {
    console.log('enter staff');
    this.checkUser();
    this.getBanners();
  }

  ngAfterViewInit() {
    // this.barChartMethod();
    this.getInspections();
    this.getYears();
    this.getStaff();
  }

  getYears() {

    this.reportYear = new Date().getFullYear();
    this.reportMonth = "All";
    this.reportMonth2 = moment().format('MMM');
    this.months2 = [];

    let months = moment.monthsShort();

    for (let month of months) {

      this.months2.push(month);
      if (month == moment().format('MMM')) {
        break;
      }
    }

    var currentYear = new Date().getFullYear();
    let startYear;
    startYear = startYear || 2017;
    while (startYear <= currentYear) {
      this.years.push(startYear++);
    }

    this.years.reverse();
    console.log('years', this.years);
  }

  async checkUser(event = null, policy_id = null) {

    this.user = null;
    this.staff = null;

    let { value }: any = await Storage.get({ key: 'staff' });
    let staff = value;

    if (staff) {
      this.staff = JSON.parse(staff);

      if (!this.userReport) {
        this.userReport = this.staff.staff_id;
      }

      console.log('staff', this.staff);
      this.getReport(event, this.userReport, moment().month(this.reportMonth2).format("M"));
      this.getReportYearly(event, this.userReport, this.reportYear, this.reportMonth);
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
    this.router.navigate(['/staff-tabs/staff-logs']);
  }

  goService() {
    this.router.navigate(['/staff-tabs/staff-services']);
  }

  goClaim() {
    this.router.navigate(['/staff-tabs/staffClaims']);
  }

  barChartMethod(reports) {

    let data = [];
    let dataRM = [];
    let label = [];

    reports.forEach(report => {

      // let temp = {
      //   label: report.month,
      //   data: [report.quantity],
      //   backgroundColor: [
      //     'rgba(255, 99, 132, 0.2)',
      //   ],
      //   borderColor: [
      //     'rgba(255,99,132,1)',
      //   ],
      //   borderWidth: 1
      // }

      dataRM.push(report.sales);
      data.push(report.quantity);
      label.push(report.month_name);

    });

    console.log('dataRM', dataRM);

    if (this.barChart) {
      this.barChart.data = {
        labels: label,
        datasets: [{
          label: 'Sales (RM)',
          data: dataRM,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          barThickness: 25,
        }]
      };
      this.barChart.update();
    } else {
      this.barChart = new Chart(this.barCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: label,
          datasets: [{
            label: 'Sales (RM)',
            data: dataRM,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            barThickness: 25,
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            y: {
              ticks: {
                precision: 0
              }
            },
            x: {
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    }

    if (this.barChart2) {
      this.barChart2.data = {
        labels: label,
        datasets: [{
          label: 'Policy unit',
          data: data,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 1,
          barThickness: 25,
        }]
      };
      this.barChart2.update();
    } else {
      this.barChart2 = new Chart(this.barCanvas2.nativeElement, {
        type: 'bar',
        data: {
          labels: label,
          datasets: [{
            label: 'Policy unit',
            data: data,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            barThickness: 25,
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            y: {
              ticks: {
                precision: 0
              }
            },
            x: {
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    }

    // backgroundColor: [
    //   'rgba(255, 99, 132, 0.2)',
    //   'rgba(54, 162, 235, 0.2)',
    //   'rgba(255, 206, 86, 0.2)',
    //   'rgba(75, 192, 192, 0.2)',
    //   'rgba(153, 102, 255, 0.2)',
    //   'rgba(255, 159, 64, 0.2)'
    // ],
    // borderColor: [
    //   'rgba(255,99,132,1)',
    //   'rgba(54, 162, 235, 1)',
    //   'rgba(255, 206, 86, 1)',
    //   'rgba(75, 192, 192, 1)',
    //   'rgba(153, 102, 255, 1)',
    //   'rgba(255, 159, 64, 1)'
    // ],

    // if (this.barChart2) {
    //   this.barChart2.data = {
    //     labels: ['RM'],
    //     datasets: [{
    //       label: 'RM' + data2,
    //       data: [data2],
    //       backgroundColor: [
    //         'rgba(54, 162, 235, 0.2)',
    //       ],
    //       borderColor: [
    //         'rgba(54, 162, 235, 1)',
    //       ],
    //       borderWidth: 1
    //     },
    //       // {
    //       //   label: 'Total RM',
    //       //   data: [data2],
    //       //   backgroundColor: [
    //       //     'rgba(54, 162, 235, 0.2)',
    //       //   ],
    //       //   borderColor: [
    //       //     'rgba(54, 162, 235, 1)',
    //       //   ],
    //       //   borderWidth: 1
    //       // }
    //     ]
    //   };
    // } else {
    //   this.barChart2 = new Chart(this.barCanvas2.nativeElement, {
    //     type: 'bar',
    //     data: {
    //       labels: ['Sales'],
    //       datasets: [{
    //         label: 'RM' + data2,
    //         data: [data2],
    //         backgroundColor: [
    //           'rgba(54, 162, 235, 0.2)',
    //         ],
    //         borderColor: [
    //           'rgba(54, 162, 235, 1)',
    //         ],
    //         borderWidth: 1
    //       },
    //         // {
    //         //   label: 'Total RM',
    //         //   data: [data2],
    //         //   backgroundColor: [
    //         //     'rgba(54, 162, 235, 0.2)',
    //         //   ],
    //         //   borderColor: [
    //         //     'rgba(54, 162, 235, 1)',
    //         //   ],
    //         //   borderWidth: 1
    //         // }
    //       ]
    //     },
    //     options: {
    //       scales: {
    //         y: {
    //           min: 0,
    //           max: data2 * 2,
    //         }
    //       }
    //     }
    //   });
    // }

  }

  getReport(event, id, month = null) {

    if (!month) {
      month = moment().format('M');
    }

    this.authService.getReports(id, month).subscribe(
      data => {

        if (data && data.data) {
          this.reports = data.data;
          // this.barChartMethod(
          //   this.reports.months
          // );
        }

        if (event) {
          event.target.complete();
        }

        console.log('report', data);
      }, error => {
        console.log(error);

        if (event) {
          event.target.complete();
        }
      });
  }

  getReportYearly(event, id, year = null, month = 'All') {

    if (!year) {
      year = moment().year();
      console.log('year', year);
    }

    if (!id) {
      id = this.userReport;
    }

    this.reportsYearly = null;

    if (month && month != 'All') {
      month = moment().month(month).format("M");
    }

    this.authService.getReportsYearly(id, year, month).subscribe(
      data => {

        if (data && data.data) {
          this.reportsYearly = data.data;
        }

        if (event) {
          event.target.complete();
        }

        console.log('reportsYearly', data);
      }, error => {
        console.log(error);

        if (event) {
          event.target.complete();
        }
      });

  }

  async getInspections() {

    let inspectionsTemp;

    let unsubscribe = this.firestore.collection('inspections').snapshotChanges().subscribe((res) => {

      inspectionsTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as any
        };
      });

      console.log('inspectionsTemp', inspectionsTemp);

      this.inspectionReports.pending = 0;
      this.inspectionReports.approved = 0;
      this.inspectionReports.rejected = 0;

      inspectionsTemp.forEach(inspect => {

        if (inspect.marketing_officer.id == this.userReport) {
          if (inspect.status == 'pending') {
            this.inspectionReports.pending++;
          } else if (inspect.status == 'proceed') {
            this.inspectionReports.approved++;
          } else if (inspect.status == 'rejected') {
            this.inspectionReports.rejected++;
          }
        }

      });

      console.log('inspectionReports', this.inspectionReports);



    });


  }

  changeReportYear() {
    console.log('reportYear', this.reportYear);

    this.getReportYearly(null, this.userReport, this.reportYear, this.reportMonth);
  }

  changeReportMonth() {
    console.log('reportMonth', this.reportYear);

    this.getReport(null, this.userReport, moment().month(this.reportMonth2).format("M"));
  }

  getStaff() {

    console.log('getStaff');

    this.authService.getStaffs().subscribe(
      (data: any) => {

        console.log('getStaff');

        if (data && data.data) {
          console.log(data);
          this.staffs = data.data;
        }

        console.log('staffs', data);
      }, error => {
        console.log('error', error);
      });

  }

  changeUser($event) {

    console.log($event.target.value);
    this.reports = null;
    this.reportsYearly = null;
    this.userReport = $event.target.value;

    this.getReport(null, $event.target.value);
    this.getReportYearly(null, $event.target.value, this.reportYear, this.reportMonth);

  }

  goPolicyPage(staff_id, type) {

    console.log(staff_id);

    let navigationExtras: NavigationExtras = {
      queryParams: {
        staff_id: staff_id,
        status: type,
      }
    };

    this.router.navigate(['/policy'], navigationExtras);
  }

  getBanners() {

    this.authService.getBanners(0).subscribe(
      (data: any) => {

        if (data && data.data) {
          this.banners = data.data;
        }

        console.log('banners', data);
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
