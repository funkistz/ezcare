import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HelperService } from '../services/helper.service';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { Preferences } from '@capacitor/preferences';
import * as moment from 'moment';

@Component({
  selector: 'app-endorsement',
  templateUrl: './endorsement.page.html',
  styleUrls: ['./endorsement.page.scss'],
})
export class EndorsementPage implements OnInit {

  segment = 'endorsement';
  // segment = 'leave';
  inspectionsTemp;
  inspections;
  user;
  staff;
  loaded;
  searchEndorsement;
  searchSponsorship;
  groupInspections;

  sponsorshipTemp;
  sponsorships;
  groupSponsorships;

  leaveSegment = 'mine';
  leaveTemp;
  leaves;
  groupLeaves;
  leaveLoaded;

  totalLeave;

  searchExgratia;
  exgratiaTemp;
  exgratias;
  groupExgratias;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private firestore: AngularFirestore,
    public helper: HelperService,
    private photoViewer: PhotoViewer,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit() {

    this.checkUser();

  }

  async checkUser(event = null, policy_id = null) {

    this.user = null;
    this.staff = null;

    let { value }: any = await Preferences.get({ key: 'staff' });
    let staff = value;

    if (staff) {
      this.staff = JSON.parse(staff);
      console.log('staff', this.staff);
      this.getTasks();
      this.getLeaves();

      this.authService.getTotalLeave(staff.staff_id, moment().year()).subscribe(
        data => {
          this.totalLeave = data.data;
          console.log('totalLeave', this.totalLeave);

        }, error => {
          console.log('error', error);
        });
    }

    this.route.queryParams.subscribe(async params => {

      if (params && params.tab) {
        this.segment = params.tab;
      }
    });

  }

  segmentChanged(ev: any) {

    this.segment = ev.detail.value;

    if (this.segment == 'endorsement') {
      this.filterEndorsement();
    } else if (this.segment == 'sponsorship') {
      this.filterSponsorship();
    } else if (this.segment == 'leave') {
      this.getLeaves();
    } else if (this.segment == 'Ex Gratia') {
      this.getLeaves();
    }
  }

  leaveSegmentChange(ev: any) {
    this.leaveSegment = ev.detail.value;
    this.getLeaves();
  }

  searchingEndorsement(event) {
    if (event.target.value) {
      this.searchEndorsement = event.target.value.toLowerCase();
    }
    this.filterEndorsement();
  }

  searchingSponsorship(event) {
    if (event.target.value) {
      this.searchSponsorship = event.target.value.toLowerCase();
    }
    this.filterSponsorship();
  }

  searchingExgratia(event) {
    if (event.target.value) {
      this.searchExgratia = event.target.value.toLowerCase();
    }
    this.filterExGratia();
  }

  filterEndorsement() {

    this.inspections = this.inspectionsTemp.filter((inspection: any) => {

      return true;

      // if (this.segment == 'mine') {

      //   if (this.staff.staff_id == inspection.marketing_officer.id) {
      //     return true;
      //   } else {
      //     return false
      //   }

      // } else {
      //   return true;
      // }

    });

    this.inspections = this.inspections.filter((inspection: any) => {

      if (this.searchEndorsement) {

        if (inspection.dealer && inspection.dealer.name) {

          return inspection.dealer.name.toLowerCase().includes(this.searchEndorsement) ||
            inspection.reg_no.toLowerCase().includes(this.searchEndorsement);

        } else if (inspection.dealer) {

          return inspection.dealer.toLowerCase().includes(this.searchEndorsement) ||
            inspection.reg_no.toLowerCase().includes(this.searchEndorsement);

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

    console.log('groupInspections', this.groupInspections);

  }

  filterSponsorship() {

    this.sponsorships = this.sponsorshipTemp.filter((inspection: any) => {

      return true;

      // if (this.segment == 'mine') {

      //   if (this.staff.staff_id == inspection.marketing_officer.id) {
      //     return true;
      //   } else {
      //     return false
      //   }

      // } else {
      //   return true;
      // }

    });

    this.sponsorships = this.sponsorships.filter((inspection: any) => {

      if (this.searchSponsorship) {

        if (inspection.dealer && inspection.dealer.name) {

          let reg_no_rule = false;

          if (inspection.reg_no) {
            reg_no_rule = inspection.reg_no.toLowerCase().includes(this.searchSponsorship)
          }

          return inspection.dealer.name.toLowerCase().includes(this.searchSponsorship) || reg_no_rule;

        } else if (inspection.dealer) {

          let reg_no_rule = false;

          if (inspection.reg_no) {
            reg_no_rule = inspection.reg_no.toLowerCase().includes(this.searchSponsorship)
          }

          return inspection.dealer.toLowerCase().includes(this.searchSponsorship) || reg_no_rule;

        } else {
          return false;
        }


      } else {
        return true;
      }

    });

    this.groupSponsorships = [];
    let indexGrow = 0;
    this.groupSponsorships[indexGrow] = {};
    this.groupSponsorships[indexGrow].data = [];

    let previousDate = null;
    if (this.sponsorships[0]) {
      previousDate = moment(this.sponsorships[0].date.toDate()).format('YYYYMM');
      this.groupSponsorships[indexGrow].name = moment(this.sponsorships[0].date.toDate()).format('MMM YYYY');
    }

    this.sponsorships.forEach(inspection => {

      const index = moment(inspection.date.toDate()).format('YYYYMM');

      if (index != previousDate) {
        indexGrow++;
        this.groupSponsorships[indexGrow] = {};
        this.groupSponsorships[indexGrow].data = [];
        this.groupSponsorships[indexGrow].name = moment(inspection.date.toDate()).format('MMM YYYY');
        previousDate = moment(inspection.date.toDate()).format('YYYYMM');
      }

      this.groupSponsorships[indexGrow].data.push(inspection);

    });

    console.log('groupSponsorships', this.groupSponsorships);

  }


  filterLeave() {

    this.leaves = this.leaveTemp.filter((leave: any) => {

      if (this.leaveSegment == 'mine') {

        if (this.staff.staff_id == leave.staff_id) {
          return true;
        } else {
          return false;
        }

      } else {
        return true;
      }

    });

    this.groupLeaves = [];
    let indexGrow = 0;
    this.groupLeaves[indexGrow] = {};
    this.groupLeaves[indexGrow].data = [];

    let previousDate = null;
    if (this.leaves[0]) {
      previousDate = moment(this.leaves[0].created_at).format('YYYYMM');
      this.groupLeaves[indexGrow].name = moment(this.leaves[0].created_at).format('MMM YYYY');
    }

    this.leaves.forEach(leave => {

      const index = moment(leave.created_at).format('YYYYMM');

      if (index != previousDate) {
        indexGrow++;
        this.groupLeaves[indexGrow] = {};
        this.groupLeaves[indexGrow].data = [];
        this.groupLeaves[indexGrow].name = moment(leave.created_at).format('MMM YYYY');
        previousDate = moment(leave.created_at).format('YYYYMM');
      }

      this.groupLeaves[indexGrow].data.push(leave);

    });

    console.log('groupLeaves', this.groupLeaves);

  }

  filterExGratia() {

    this.exgratias = this.exgratiaTemp.filter((exgratia: any) => {

      return true;

    });

    this.exgratias = this.exgratias.filter((exgratia: any) => {

      if (this.searchExgratia) {

        if (exgratia.dealer && exgratia.dealer.name) {

          return exgratia.dealer.name.toLowerCase().includes(this.searchExgratia) ||
            exgratia.reg_no.toLowerCase().includes(this.searchExgratia);

        } else if (exgratia.dealer) {

          return exgratia.dealer.toLowerCase().includes(this.searchExgratia) ||
            exgratia.reg_no.toLowerCase().includes(this.searchExgratia);

        } else {
          return false;
        }


      } else {
        return true;
      }

    });

    // groupExgratias
    // exgratias

    this.groupExgratias = [];
    let indexGrow = 0;
    this.groupExgratias[indexGrow] = {};
    this.groupExgratias[indexGrow].data = [];

    let previousDate = null;
    if (this.exgratias[0]) {
      previousDate = moment(this.exgratias[0].date.toDate()).format('YYYYMM');
      this.groupExgratias[indexGrow].name = moment(this.exgratias[0].date.toDate()).format('MMM YYYY');
    }

    this.exgratias.forEach(inspection => {

      const index = moment(inspection.date.toDate()).format('YYYYMM');

      if (index != previousDate) {
        indexGrow++;
        this.groupExgratias[indexGrow] = {};
        this.groupExgratias[indexGrow].data = [];
        this.groupExgratias[indexGrow].name = moment(inspection.date.toDate()).format('MMM YYYY');
        previousDate = moment(inspection.date.toDate()).format('YYYYMM');
      }

      this.groupExgratias[indexGrow].data.push(inspection);

    });

    console.log('groupExgratias', this.groupExgratias);

  }

  getTasks() {

    // this.helper.presentLoading();

    this.firestore.collection('endorsement', ref => ref.orderBy('date', 'desc')).snapshotChanges().subscribe((res) => {

      // this.helper.dissmissLoading();
      this.loaded = true;

      this.inspectionsTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as Object
        };
      });

      this.filterEndorsement();
    });

    this.firestore.collection('sponsorship', ref => ref.orderBy('date', 'desc')).snapshotChanges().subscribe((res) => {

      // this.helper.dissmissLoading();
      this.loaded = true;

      this.sponsorshipTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as Object
        };
      });

      this.filterSponsorship();
    });

    this.firestore.collection('exgratia', ref => ref.orderBy('date', 'desc')).snapshotChanges().subscribe((res) => {

      // this.helper.dissmissLoading();
      this.loaded = true;

      this.exgratiaTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as Object
        };
      });

      this.filterExGratia();
    });

    // this.firestore.collection('staff_leaves', ref => ref.orderBy('start_date', 'asc')).snapshotChanges().subscribe((res) => {

    //   // this.helper.dissmissLoading();
    //   this.leaveLoaded = true;

    //   this.leaveTemp = res.map((t) => {

    //     return {
    //       id: t.payload.doc.id,
    //       ...t.payload.doc.data() as Object
    //     };
    //   });

    //   console.log('leave loaded', this.leaveTemp);

    //   this.filterLeave();
    // });

  }

  addEndorsement() {
    this.router.navigate(['/staff-tabs/endorsement/add']);
  }

  viewLog(inspection_id) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        inspection_id: inspection_id
      }
    };
    this.router.navigate(['/staff-tabs/endorsement/add'], navigationExtras);
  }

  addSponsorship() {
    this.router.navigate(['/staff-tabs/endorsement/addSponsorship']);
  }

  viewSponsorship(inspection_id) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        inspection_id: inspection_id
      }
    };
    this.router.navigate(['/staff-tabs/endorsement/addSponsorship'], navigationExtras);
  }

  viewLeave(leave_id) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        leave_id: leave_id
      }
    };
    this.router.navigate(['/staff-tabs/endorsement/addLeave'], navigationExtras);
  }

  addExgratia() {
    this.router.navigate(['/staff-tabs/endorsement/addExgratia']);
  }

  viewExgratia(inspection_id) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        inspection_id: inspection_id
      }
    };
    this.router.navigate(['/staff-tabs/endorsement/addExgratia'], navigationExtras);
  }

  imagePreview(src) {

    this.photoViewer.show(src);

  }

  addLeave() {
    this.router.navigate(['/staff-tabs/endorsement/addLeave']);
  }

  getLeaves() {

    this.leaveLoaded = false;
    this.groupLeaves = [];

    console.log('this.leaveSegment', this.leaveSegment);
    let staff_id = 0;
    if (this.leaveSegment == 'mine') {
      staff_id = this.staff.staff_id;
    }

    this.authService.getAllLeaves(staff_id).subscribe(
      data => {

        if (data) {

          this.leaveLoaded = true;
          this.leaveTemp = data.data;
          console.log('getAllLeaves', data);
          this.filterLeave();
        }
      }, error => {
        this.leaveLoaded = true;
      });

  }
}
