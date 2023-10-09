/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HelperService } from '../services/helper.service';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { Preferences } from '@capacitor/preferences';
import * as moment from 'moment';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-staff-inspection',
  templateUrl: './staff-inspection.page.html',
  styleUrls: ['./staff-inspection.page.scss'],
})
export class StaffInspectionPage implements OnInit {

  segment = 'schedule';
  scheduleSegment = 'unassigned';
  nonInspectSegment = 'mine';
  inspectSegment = 'mine';

  inspectionLoaded = false;
  inspectionsTemp;
  inspections;
  groupInspections;

  scheduleLoaded = false;
  scheduleInspectionsTemp;
  scheduleInspections;
  groupScheduleInspections;

  nonInspectionLoaded = false;
  nonInspectionsTemp;
  nonInspections;
  groupNonInspections;

  user;
  staff;
  search;
  dayFilter = null;
  branch;
  monthGap = 1;
  filterEndMonth: any = moment().endOf('month');
  filterStartMonth: any = moment(this.filterEndMonth).startOf('month');

  inspectionFirestore;
  nonInspectionFirestore;
  scheduleInspectionFirestore;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private firestore: AngularFirestore,
    public helper: HelperService,
    private photoViewer: PhotoViewer,
    public alertController: AlertController,
  ) { }

  ngOnInit() {

    this.checkUser();
    // this.getSchedule();
    // this.getInspection();
    // this.getNonInspection();
    this.helper.getStaffs();
  }

  async checkUser(event = null, policy_id = null) {

    this.user = null;
    this.staff = null;

    let { value }: any = await Preferences.get({ key: 'staff' });
    let staff = value;

    if (staff) {
      this.staff = JSON.parse(staff);
      this.branch = Number(this.staff.user_branch);
      console.log('staff', this.staff, this.branch);
      // this.getTasks();
      this.getSchedule();
    }
  }

  segmentChange(ev: any) {
    this.segment = ev.detail.value;

    if (this.inspectionFirestore) {
      this.inspectionFirestore.unsubscribe();
    }
    if (this.nonInspectionFirestore) {
      this.nonInspectionFirestore.unsubscribe();
    }
    if (this.scheduleInspectionFirestore) {
      this.scheduleInspectionFirestore.unsubscribe();
    }

    if (this.segment === 'schedule') {
      this.inspectionFirestore.unsubscribe();
      this.getSchedule();

    } else if (this.segment === 'inspection') {
      this.getInspection();

    } else if (this.segment === 'noninspection') {
      this.getNonInspection();
    }

  }

  scheduleSegmentChange(ev: any) {

    this.togglePickup(false);

    this.scheduleSegment = ev.detail.value;
    this.filterScheduleData();
  }

  inspectionSegmentChange(ev: any) {

    this.inspectSegment = ev.detail.value;
    this.filterInspection();
  }

  nonInspectionSegmentChange(ev: any) {

    this.nonInspectSegment = ev.detail.value;
    this.filterNonInspection();
  }

  changeFilterDateRange(type) {

    if (type === 'up') {
      this.filterStartMonth = this.filterStartMonth.add(this.monthGap, 'months').startOf('month');
      this.filterEndMonth = this.filterEndMonth.add(this.monthGap, 'months').endOf('month');
    } else if (type === 'down') {
      this.filterStartMonth = this.filterStartMonth.subtract(this.monthGap, 'months').startOf('month');
      this.filterEndMonth = this.filterEndMonth.subtract(this.monthGap, 'months').endOf('month');
    }

    if (this.segment === 'schedule') {
      this.getSchedule();
    } else if (this.segment === 'inspection') {
      this.getInspection();
    } else if (this.segment === 'noninspection') {
      this.getNonInspection();
    }
  }

  async getInspection() {

    this.inspectionLoaded = false;
    this.groupInspections = [];

    if (this.inspectionFirestore) {
      this.inspectionFirestore.unsubscribe();
    }
    this.inspectionFirestore = await this.firestore.collection('inspections', (ref: any) => {

      ref = ref.where('date', '>=', moment(this.filterStartMonth).toDate());
      ref = ref.where('date', '<=', moment(this.filterEndMonth).endOf('month').toDate());
      ref = ref.orderBy('date', 'desc');

      if (this.branch && this.branch != 8) {
        ref = ref.where('branch.id', '==', this.branch);
      }
      return ref;

    }).snapshotChanges().subscribe((res) => {

      this.inspectionLoaded = true;

      this.inspectionsTemp = res.map((t) => ({
        id: t.payload.doc.id,
        ...t.payload.doc.data() as any
      }));

      // console.log('inspectionsTemp', this.inspectionsTemp);

      this.filterInspection();
      this.inspectionFirestore.unsubscribe();

    }, err => {
      this.inspectionLoaded = true;
      console.log('inspections err', err);
    });

  }

  filterInspection() {

    //filter by schedule segment
    this.inspections = this.inspectionsTemp.filter((inspection: any) => {

      if (this.inspectSegment == 'mine') {

        if (this.staff.staff_id == inspection.marketing_officer.id && inspection.status != 'booked') {
          return true;
        } else {
          return false;
        }

      } else if (this.inspectSegment == 'all') {
        return inspection.status != 'booked';
      }

    });

    // this.inspections = this.inspections.sort(
    //   (objA, objB) => objB.date - objA.date,
    // );

    // this.inspections = this.inspectionsFilterByBranch(this.inspections, this.branch);

    this.inspections = this.inspections.filter((inspection: any) => {

      if (this.dayFilter) {

        if (moment(inspection.date.toDate()).format('YYYY-MM-DD') == this.dayFilter) {

        } else {
          return false;
        }

      }

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

    console.log('group inspection', this.groupInspections);

  }

  async getSchedule() {

    this.scheduleLoaded = false;
    this.groupScheduleInspections = [];

    if (this.scheduleInspectionFirestore) {
      this.scheduleInspectionFirestore.unsubscribe();
    }
    this.scheduleInspectionFirestore = await this.firestore.collection('schedule_inspections', (ref: any) => {
      ref = ref.where('reminder_date', '>=', moment(this.filterStartMonth).toDate());
      ref = ref.where('reminder_date', '<=', moment(this.filterEndMonth).endOf('month').toDate());
      ref = ref.orderBy('reminder_date', 'desc');

      console.log('this.branch', this.branch);
      if (this.branch && this.branch != 8) {
        ref = ref.where('branch.id', '==', this.branch);
      }
      return ref;
    }).snapshotChanges().subscribe((res) => {

      this.scheduleLoaded = true;

      this.scheduleInspectionsTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as any
        };
      });

      // console.log('schedule data', this.scheduleInspectionsTemp);

      this.filterScheduleData();
      // console.log('filterScheduleData', this.scheduleInspections);
      this.scheduleInspectionFirestore.unsubscribe();

    }, err => {
      this.scheduleLoaded = true;
      console.log('inspections err', err);
    });


  }

  filterScheduleData() {

    console.log('filterScheduleData', this.scheduleSegment);

    //filter by schedule segment
    this.scheduleInspections = this.scheduleInspectionsTemp.filter((inspection: any) => {

      if (this.scheduleSegment == 'unassigned') {

        return !inspection.person_in_charge;

      } else if (this.scheduleSegment == 'mine') {

        return (inspection.person_in_charge && inspection.person_in_charge.id == this.staff.staff_id) || (inspection.marketing_officer && inspection.marketing_officer.id == this.staff.staff_id);

      } else if (this.scheduleSegment == 'all') {

        return true;

      }

    });

    //filter by reminder date
    // this.scheduleInspections = this.scheduleInspections.filter((inspection: any) => {

    //   if (this.scheduleSegment == 'unassigned' || this.scheduleSegment == 'mine') {

    //     if (moment(inspection.reminder_date.toDate()).diff(new Date(), 'days') >= 0) {

    //       if (this.dayFilter) {

    //         if (moment(inspection.reminder_date.toDate()).format('YYYY-MM-DD') == this.dayFilter) {
    //           return true;
    //         } else {
    //           return false;
    //         }

    //       } else {
    //         return true;
    //       }

    //     } else {
    //       return false;
    //     }
    //   } else if (this.scheduleSegment == 'all') {

    //     if (moment(inspection.reminder_date.toDate()).diff(new Date(), 'days') < 0) {

    //       if (this.dayFilter) {

    //         if (moment(inspection.reminder_date.toDate()).format('YYYY-MM-DD') == this.dayFilter) {
    //           return true;
    //         } else {
    //           return false;
    //         }

    //       } else {
    //         return true;
    //       }

    //     } else {
    //       return false;
    //     }
    //   }

    // });
    // this.scheduleInspections = this.inspectionsFilterByBranch(this.scheduleInspections, this.branch);

    //search
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

    // console.log('after filter', this.scheduleInspections);

  }

  async getNonInspection() {

    this.nonInspectionLoaded = false;
    this.groupNonInspections = [];

    if (this.nonInspectionFirestore) {
      this.nonInspectionFirestore.unsubscribe();
    }
    this.nonInspectionFirestore = await this.firestore.collection('non_inspections', (ref: any) => {
      ref = ref.where('date', '>=', moment(this.filterStartMonth).toDate());
      ref = ref.where('date', '<=', moment(this.filterEndMonth).endOf('month').toDate());
      ref = ref.orderBy('date', 'desc');

      if (this.branch && this.branch != 8) {
        ref = ref.where('branch.id', '==', this.branch);
      }
      return ref;
    }).snapshotChanges().subscribe((res) => {

      this.nonInspectionLoaded = true;

      this.nonInspectionsTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as any
        };
      });

      this.filterNonInspection();
      // this.nonInspectionFirestore.unsubscribe();

    }, err => {
      this.nonInspectionLoaded = true;
      console.log('nonInspectionsTemp err', err);
    });


  }

  filterNonInspection() {

    //filter by schedule segment
    this.nonInspections = this.nonInspectionsTemp.filter((inspection: any) => {

      if (this.nonInspectSegment == 'mine') {

        if (this.staff.staff_id == inspection.marketing_officer.id && inspection.status != 'booked') {
          return true;
        } else {
          return false;
        }

      } else if (this.nonInspectSegment == 'all') {
        return inspection.status != 'booked';
      }

    });

    // this.nonInspections = this.nonInspections.sort(
    //   (objA, objB) => objB.date - objA.date,
    // );

    // this.nonInspections = this.inspectionsFilterByBranch(this.nonInspections, this.branch);

    this.nonInspections = this.nonInspections.filter((inspection: any) => {

      // if (this.dayFilter) {

      //   if (moment(inspection.date.toDate()).format('YYYY-MM-DD') == this.dayFilter) {

      //   } else {
      //     return false;
      //   }

      // }

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

    this.groupNonInspections = [];
    let indexGrow = 0;
    this.groupNonInspections[indexGrow] = {};
    this.groupNonInspections[indexGrow].data = [];

    let previousDate = null;

    console.log('this.nonInspections', this.nonInspections);

    if (this.nonInspections[0]) {
      previousDate = moment(this.nonInspections[0].date.toDate()).format('YYYYMM');
      this.groupNonInspections[indexGrow].name = moment(this.nonInspections[0].date.toDate()).format('MMM YYYY');
    }

    this.nonInspections.forEach(inspection => {

      const index = moment(inspection.date.toDate()).format('YYYYMM');

      if (index != previousDate) {
        indexGrow++;
        this.groupNonInspections[indexGrow] = {};
        this.groupNonInspections[indexGrow].data = [];
        this.groupNonInspections[indexGrow].name = moment(inspection.date.toDate()).format('MMM YYYY');
        previousDate = moment(inspection.date.toDate()).format('YYYYMM');
      }

      this.groupNonInspections[indexGrow].data.push(inspection);

    });

    console.log('groupNonInspections', this.groupNonInspections);
  }

  searching(event) {
    this.search = event.target.value.toLowerCase();
    this.segmentFilterData();
  }

  inspectionsFilterByBranch(inspections, branch) {
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

  changeBranch(event) {

    this.segmentFilterData();

  }

  segmentFilterData() {

    if (this.segment == 'schedule') {
      this.getSchedule();
    } else if (this.segment == 'inspection') {
      this.getInspection();
    } else if (this.segment == 'noninspection') {
      this.getNonInspection();
    }

  }

  filterByDay() {

    console.log('dayFilter', this.dayFilter);

    if (this.dayFilter) {
      this.filterEndMonth = moment(this.dayFilter).startOf('month');
      this.filterStartMonth = moment(this.filterEndMonth).subtract(this.monthGap, 'months');
    } else {
      this.filterEndMonth = moment().startOf('month');
      this.filterStartMonth = moment(this.filterEndMonth).subtract(this.monthGap, 'months');
    }

    if (this.segment == 'schedule') {

      this.filterScheduleData();

    } else if (this.segment == 'inspection') {

      this.filterInspection();

    } else if (this.segment == 'noninspection') {

      this.filterNonInspection();

    }


  }


  //start schedule feature

  beginPickup = false;
  pickupedInspectionIds = [];

  togglePickup(pickup) {

    this.beginPickup = pickup;
    this.pickupedInspectionIds = [];

  }

  scheduleAction(id) {

    if (!this.beginPickup) {

      let navigationExtras: NavigationExtras = {
        queryParams: {
          inspection_id: id
        }
      };
      this.router.navigate(['/staff-tabs/staff-inspection/add-schedule'], navigationExtras);

      return;
    }

    if (this.pickupedInspectionIds.includes(id)) {
      this.pickupedInspectionIds = this.pickupedInspectionIds.filter((value) => value != id);

    } else {
      this.pickupedInspectionIds.push(id)
    }

    console.log('pickups', this.pickupedInspectionIds);
  }

  async pickupAllSelectedInspection() {

    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Are you sure want to pickup all the selected schedule inspection?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Pickup',
          id: 'confirm-button',
          handler: async () => {

            await this.pickupedInspectionIds.forEach(async inspect => {

              console.log('id', inspect);

              await this.firestore.doc<any>('schedule_inspections/' + inspect).update({
                person_in_charge: {
                  name: this.staff.user_fullname,
                  id: Number(this.staff.staff_id),
                  user_id: Number(this.staff.user_id),
                },
              }).then(() => {


              }).catch(error => {
                this.helper.presentToast('Sorry, there is some error occured.');
                console.log(error);
              });

            });

            this.scheduleSegment = 'mine';

          }
        }
      ]
    });

    await alert.present();

    // this.helper.presentLoading();



  }

  addSchedule() {
    this.router.navigate(['/staff-tabs/staff-inspection/add-schedule']);
  }

  addInspection() {
    this.router.navigate(['/staff-tabs/staff-inspection/add-logs']);
  }

  viewInspection(inspection_id) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        inspection_id: inspection_id
      }
    };
    this.router.navigate(['/staff-tabs/staff-inspection/add-logs'], navigationExtras);
  }

  addNonInspection() {
    this.router.navigate(['/staff-tabs/staff-inspection/add-non-inspect']);
  }

  viewNonInspection(inspection_id) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        inspection_id: inspection_id
      }
    };
    this.router.navigate(['/staff-tabs/staff-inspection/add-non-inspect'], navigationExtras);
  }

}
