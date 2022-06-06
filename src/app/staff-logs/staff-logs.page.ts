import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HelperService } from '../services/helper.service';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { Storage } from '@capacitor/storage';
import * as moment from 'moment';

export class TODO {
  $key: string;
  chassis: string;
  date: string;
  dealer: string;
  images: Array<any>;
  marketing_officer: string;
  mileage: string;
  remarks: string;
  vehicle: string;
}

@Component({
  selector: 'app-staff-logs',
  templateUrl: './staff-logs.page.html',
  styleUrls: ['./staff-logs.page.scss'],
})
export class StaffLogsPage implements OnInit {

  segment = 'mine';
  inspectionsTemp;
  inspections;
  user;
  staff;
  loaded;
  search;
  groupInspections;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private firestore: AngularFirestore,
    private helper: HelperService,
    private photoViewer: PhotoViewer,
  ) {

  }

  ngOnInit() {

    this.checkUser();
    this.helper.getStaffs();

  }

  async checkUser(event = null, policy_id = null) {

    this.user = null;
    this.staff = null;

    let { value }: any = await Storage.get({ key: 'staff' });
    let staff = value;

    if (staff) {
      this.staff = JSON.parse(staff);
      console.log('staff', this.staff);
      this.getTasks();
    }
  }

  segmentChanged(ev: any) {

    this.segment = ev.detail.value;
    this.filterData();
  }

  searching(event) {
    this.search = event.target.value.toLowerCase();
    this.filterData();
  }

  filterData() {

    console.log(this.segment);

    this.inspections = this.inspectionsTemp.filter((inspection: any) => {

      if (this.segment == 'mine') {

        if (this.staff.staff_id == inspection.marketing_officer.id && inspection.status != 'booked') {
          return true;
        } else {
          return false;
        }

      } else if (this.segment == 'all') {

        if (inspection.status != 'booked') {
          return true;
        } else {
          return false;
        }
      } else if (this.segment == 'schedule') {

        if (inspection.status == 'booked' && moment(inspection.reminder_date.toDate()).diff(new Date(), 'days') >= 0) {
          console.log(moment(inspection.reminder_date.toDate()).diff(new Date(), 'days'));
          return true;
        } else {
          return false;
        }
      } else if (this.segment == 'history') {

        if (inspection.status == 'booked') {
          return true;
        } else {
          return false;
        }
      }

    });


    if (this.segment == 'history') {

      this.inspections = this.inspections.sort(
        (objA, objB) => objB.reminder_date - objA.reminder_date,
      );

    } else if (this.segment == 'all' || this.segment == 'mine') {

      this.inspections = this.inspections.sort(
        (objA, objB) => objB.date - objA.date,
      );

    } else if (this.segment == 'schedule') {

      this.inspections = this.inspections.sort(
        (objA, objB) => objA.reminder_date - objB.reminder_date,
      );

    }

    this.inspections = this.inspections.filter((inspection: any) => {

      if (this.search) {

        if (inspection.dealer) {

          if (inspection.marketing_officer && inspection.marketing_officer.name) {
            return inspection.dealer.toLowerCase().includes(this.search) ||
              inspection.marketing_officer.name.toLowerCase().includes(this.search) ||
              inspection.dealer.toLowerCase().includes(this.search);
          } else {
            return inspection.dealer.toLowerCase().includes(this.search) ||
              inspection.dealer.toLowerCase().includes(this.search);
          }

        } else {
          return false;
        }


      } else {
        return true;
      }

    });

    this.groupInspections = [];
    let indexGrow = 0;
    this.groupInspections[indexGrow] = {};
    this.groupInspections[indexGrow].data = [];

    let previousDate = null;

    if (this.segment == 'mine' || this.segment == 'all') {

      if (this.inspections[0]) {
        previousDate = moment(this.inspections[0].date.toDate()).format('YYYYMM');
        this.groupInspections[indexGrow].name = moment(this.inspections[0].date.toDate()).format('MMM YYYY');
      }

      this.inspections.forEach(inspection => {

        const index = moment(inspection.date.toDate()).format('YYYYMM');

        if (index != previousDate) {
          indexGrow++;
          this.groupInspections[indexGrow] = {};
          this.groupInspections[indexGrow].data = [];
          this.groupInspections[indexGrow].name = moment(inspection.date.toDate()).format('MMM YYYY');
          previousDate = moment(inspection.date.toDate()).format('YYYYMM');
        }

        this.groupInspections[indexGrow].data.push(inspection);

      });

    } else {

      if (this.inspections[0]) {
        previousDate = moment(this.inspections[0].reminder_date.toDate()).format('YYYYMM');
        this.groupInspections[indexGrow].name = moment(this.inspections[0].reminder_date.toDate()).format('MMM YYYY');
      }

      this.inspections.forEach(inspection => {

        const index = moment(inspection.reminder_date.toDate()).format('YYYYMM');

        if (index != previousDate) {
          indexGrow++;
          this.groupInspections[indexGrow] = {};
          this.groupInspections[indexGrow].data = [];
          this.groupInspections[indexGrow].name = moment(inspection.reminder_date.toDate()).format('MMM YYYY');
          previousDate = moment(inspection.reminder_date.toDate()).format('YYYYMM');
        }

        this.groupInspections[indexGrow].data.push(inspection);

      });

    }
  }

  getTasks() {

    this.helper.presentLoading();

    return this.firestore.collection('inspections', ref => ref.orderBy('date', 'desc')).snapshotChanges().subscribe((res) => {

      this.helper.dissmissLoading();
      this.loaded = true;

      this.inspectionsTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as TODO
        };
      });

      this.filterData();
    }, err => {
      this.helper.dissmissLoading();
      this.loaded = true;
      console.log('inspections err', err);
    });
  }

  addLog() {
    this.router.navigate(['/staff-tabs/staff-logs/add-logs']);
  }

  viewLog(inspection_id) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        inspection_id: inspection_id
      }
    };
    this.router.navigate(['/staff-tabs/staff-logs/add-logs'], navigationExtras);
  }

  imagePreview(src) {

    this.photoViewer.show(src);

  }

}
