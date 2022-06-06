import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HelperService } from '../services/helper.service';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { Storage } from '@capacitor/storage';
import * as moment from 'moment';

@Component({
  selector: 'app-endorsement',
  templateUrl: './endorsement.page.html',
  styleUrls: ['./endorsement.page.scss'],
})
export class EndorsementPage implements OnInit {

  segment = 'endorsement';
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

    if (this.segment == 'endorsement') {
      this.filterEndorsement();
    } else {
      this.filterSponsorship();
    }
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

        if (inspection.dealer) {
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

        if (inspection.dealer) {

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

  getTasks() {

    this.helper.presentLoading();

    this.firestore.collection('endorsement', ref => ref.orderBy('date', 'desc')).snapshotChanges().subscribe((res) => {

      this.helper.dissmissLoading();
      this.loaded = true;

      this.inspectionsTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as Object
        };
      });

      console.log('inspections', this.inspectionsTemp);

      this.filterEndorsement();
    });

    this.firestore.collection('sponsorship', ref => ref.orderBy('date', 'desc')).snapshotChanges().subscribe((res) => {

      this.helper.dissmissLoading();
      this.loaded = true;

      this.sponsorshipTemp = res.map((t) => {

        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as Object
        };
      });

      console.log('sponsorship', this.sponsorshipTemp);

      this.filterSponsorship();
    });
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

  imagePreview(src) {

    this.photoViewer.show(src);

  }

}
