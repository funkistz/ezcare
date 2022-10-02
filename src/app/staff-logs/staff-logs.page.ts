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
  groupInspections;

  scheduleInspectionsTemp;
  scheduleInspections;
  groupScheduleInspections;

  user;
  staff;
  loaded;
  search;
  dayFilter = null;
  branch;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private firestore: AngularFirestore,
    public helper: HelperService,
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
      this.branch = this.staff.user_branch;
      console.log('staff', this.staff, this.branch);
      this.getTasks();
      this.getSchedule();
    }
  }

  segmentChanged(ev: any) {

    this.segment = ev.detail.value;
    this.segmentFilterData();
  }

  searching(event) {
    this.search = event.target.value.toLowerCase();
    this.segmentFilterData();
  }

  segmentFilterData() {

    if (this.segment == 'mine' || this.segment == 'all') {
      this.filterData();
    } else {
      this.filterScheduleData();
    }

  }

  filterData(day = null) {

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
          // console.log(moment(inspection.reminder_date.toDate()).diff(new Date(), 'days'));

          if (day) {

            // console.log('day', day);
            // console.log('today', moment(inspection.reminder_date.toDate()).format('YYYY-MM-DD'));

            if (moment(inspection.reminder_date.toDate()).format('YYYY-MM-DD') == day) {
              return true;
            } else {
              return false;
            }

          } else {
            return true;
          }

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

    const staffIds = this.helper.getAllUserIDByBranch(this.staff.user_branch);
    // console.log('staffIds', staffIds);

    this.inspections = this.inspectionsFilterByBranch(this.inspections, this.branch);

    // console.log('inspections', this.inspections);

    this.inspections = this.inspections.filter((inspection: any) => {

      if (this.search) {

        if (inspection.dealer && inspection.dealer.name) {

          if (inspection.marketing_officer && inspection.marketing_officer.name) {
            return inspection.dealer.name.toLowerCase().includes(this.search) ||
              inspection.marketing_officer.name.toLowerCase().includes(this.search) ||
              inspection.dealer.name.toLowerCase().includes(this.search)
              || inspection.chassis.toLowerCase().includes(this.search);
          } else {
            return inspection.dealer.name.toLowerCase().includes(this.search) ||
              inspection.dealer.name.toLowerCase().includes(this.search)
              || inspection.chassis.toLowerCase().includes(this.search);
          }

        } else if (inspection.dealer) {

          if (inspection.marketing_officer && inspection.marketing_officer.name) {
            return inspection.dealer.toLowerCase().includes(this.search) ||
              inspection.marketing_officer.name.toLowerCase().includes(this.search) ||
              inspection.dealer.toLowerCase().includes(this.search)
              || inspection.chassis.toLowerCase().includes(this.search);
          } else {
            return inspection.dealer.toLowerCase().includes(this.search) ||
              inspection.dealer.toLowerCase().includes(this.search)
              || inspection.chassis.toLowerCase().includes(this.search);
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

  changeBranch(event) {

    // console.log('branch', event.detail.value);
    // console.log('this.branch', this.branch);
    // this.branch = ;

    this.segmentFilterData();

  }

  inspectionsFilterByBranch(inspections, branch) {

    // const staffs = this.helper.getAllUserIDByBranch(branch);
    // console.log('staffs filter', staffs);

    return inspections.filter((inspection: any) => {

      if (branch == 8) {
        return true
      } else {

        if (!inspection.branch) {
          return true;
        } else if (inspection.branch.id == branch) {
          return true;
        }
      }

      return false;

    });

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

      console.log('inspectionsTemp', this.inspectionsTemp);

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

  viewScheduleLog(inspection_id) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        inspection_id: inspection_id
      }
    };
    this.router.navigate(['/staff-tabs/staff-logs/add-schedule'], navigationExtras);
  }

  imagePreview(src) {

    this.photoViewer.show(src);

  }

  filterByDay() {

    if (this.dayFilter != 'all') {
      this.filterScheduleData(this.dayFilter);
    } else {
      this.filterScheduleData();
    }
  }

  getSchedule() {

    // this.helper.presentLoading();

    return this.firestore.collection('schedule_inspections', ref => ref.orderBy('date', 'desc')).snapshotChanges().subscribe((res) => {

      this.helper.dissmissLoading();
      this.loaded = true;

      this.scheduleInspectionsTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as TODO
        };
      });

      console.log('schedule data', this.scheduleInspectionsTemp);

      this.filterScheduleData();
      console.log('filterScheduleData', this.scheduleInspections);

    }, err => {
      this.helper.dissmissLoading();
      this.loaded = true;
      console.log('inspections err', err);
    });
  }

  filterScheduleData(day = null) {

    this.scheduleInspections = this.scheduleInspectionsTemp.filter((inspection: any) => {

      if (this.segment == 'schedule') {

        if (moment(inspection.reminder_date.toDate()).diff(new Date(), 'days') >= 0) {

          if (day) {

            if (moment(inspection.reminder_date.toDate()).format('YYYY-MM-DD') == day) {
              return true;
            } else {
              return false;
            }

          } else {
            return true;
          }

        } else {
          return false;
        }
      } else if (this.segment == 'history') {

        if (moment(inspection.reminder_date.toDate()).diff(new Date(), 'days') < 0) {

          if (day) {

            if (moment(inspection.reminder_date.toDate()).format('YYYY-MM-DD') == day) {
              return true;
            } else {
              return false;
            }

          } else {
            return true;
          }

        } else {
          return false;
        }
      }

    });

    this.scheduleInspections = this.inspectionsFilterByBranch(this.scheduleInspections, this.branch);

    this.scheduleInspections = this.scheduleInspections.filter((inspection: any) => {

      if (this.search) {

        if (inspection.dealer && inspection.dealer.name) {

          if (inspection.marketing_officer && inspection.marketing_officer.name) {
            return inspection.dealer.name.toLowerCase().includes(this.search) ||
              inspection.marketing_officer.name.toLowerCase().includes(this.search) ||
              inspection.dealer.name.toLowerCase().includes(this.search);
          } else {
            return inspection.dealer.name.toLowerCase().includes(this.search) ||
              inspection.dealer.name.toLowerCase().includes(this.search);
          }

        } else if (inspection.dealer) {

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

    this.groupScheduleInspections = [];
    let indexGrow = 0;
    this.groupScheduleInspections[indexGrow] = {};
    this.groupScheduleInspections[indexGrow].data = [];

    let previousDate = null;

    if (this.scheduleInspections[0]) {
      previousDate = moment(this.scheduleInspections[0].reminder_date.toDate()).format('YYYYMM');
      this.groupScheduleInspections[indexGrow].name = moment(this.scheduleInspections[0].reminder_date.toDate()).format('MMM YYYY');
    }

    this.scheduleInspections.forEach(inspection => {

      const index = moment(inspection.reminder_date.toDate()).format('YYYYMM');

      if (index != previousDate) {
        indexGrow++;
        this.groupScheduleInspections[indexGrow] = {};
        this.groupScheduleInspections[indexGrow].data = [];
        this.groupScheduleInspections[indexGrow].name = moment(inspection.reminder_date.toDate()).format('MMM YYYY');
        previousDate = moment(inspection.reminder_date.toDate()).format('YYYYMM');
      }

      this.groupScheduleInspections[indexGrow].data.push(inspection);

    });

  }

  addScheduleLog() {
    this.router.navigate(['/staff-tabs/staff-logs/add-schedule']);
  }
}
