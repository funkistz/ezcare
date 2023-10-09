/* eslint-disable arrow-body-style */
/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HelperService } from '../services/helper.service';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as moment from 'moment';
import { types } from 'util';
import { ActionSheetController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { NavController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-add-leave',
  templateUrl: './add-leave.page.html',
  styleUrls: ['./add-leave.page.scss'],
})
export class AddLeavePage implements OnInit {

  id;
  is_edit = false;
  leave;
  staff;
  currentStaff;
  leaveForm: FormGroup;
  types_firebase;
  types;
  day_types = [
    {
      id: 1,
      name: 'Full Day'
    },
    {
      id: 2,
      name: '0.5 AM'
    },
    {
      id: 3,
      name: '0.5 PM'
    }
  ];
  noReasonLeave = ['sl', 'hl', 'pl', 'ml'];
  withImageLeave = ['sl', 'hl', 'cl'];
  start_date = new Date().toISOString().split('T')[0];
  max_end_date;
  leaveImages = [];
  leaveImagesURL = [];
  withImage = false;
  hr_comment = '';

  myLeaves;
  totalDays;
  leaveBalances = {
    'al': 0,
    'el': 0,
    'ul': 999,
    'sl': 0,
    'hl': 0,
    'ml': 0,
    'pl': 0,
    'cl': 0,
  };
  leaveBalance = 0;
  leaveBalanceAL = 0;
  leaveBalanceUL = 999;
  leaveBalanceSL = 0;
  leaveBalanceHL = 0;
  leaveBalanceML = 0;
  leaveBalancePL = 0;
  leaveBalanceCL = 0;

  leaveType = {
    'al': 'Anual',
    'el': 'Emergency',
    'ul': 'Unpaid',
    'sl': 'Sick leave',
    'hl': 'Hospitalization',
    'ml': 'Maternity',
    'pl': 'Paternity',
    'cl': 'Compassionate',
  };

  constructor(
    private firestore: AngularFirestore,
    public helper: HelperService,
    public formBuilder: FormBuilder,
    private actionSheetCtrl: ActionSheetController,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private route: ActivatedRoute, private router: Router,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.helper.presentLoading();

    this.leaveForm = this.formBuilder.group({
      type: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      start_day: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
      end_day: [1, [Validators.required]],
      no_of_day: [1, [Validators.required]],
      reasons: ['', [Validators.required]],
    });

    const leaveFire = this.firestore.collection('leave_type', ref => ref.orderBy('position', 'asc')).snapshotChanges().subscribe((res) => {

      this.types_firebase = res.map((t) => ({
        id: t.payload.doc.id,
        ...t.payload.doc.data() as Object
      }));
      this.types = [...this.types_firebase];
      this.leaveForm.controls['type'].setValue(this.types[0].code);

      this.route.queryParams.subscribe(async params => {

        await this.getStaff();

        if (params && params.leave_id) {
          this.id = params.leave_id;
          this.getLeave(this.id);
        } else {
          // this.getMyLeave(this.currentStaff.staff_id);
          this.getLeaveBalance(this.currentStaff.staff_id, moment().startOf('day').year());

          const after5Days = moment(new Date().toISOString().split('T')[0]).add(5, 'days').format('YYYY-MM-DD');
          this.max_end_date = after5Days;
          this.leaveForm.controls['start_date'].setValue(after5Days);
          this.leaveForm.controls['end_date'].setValue(after5Days);
          this.leaveForm.controls['start_day'].setValue(1);
          this.leaveForm.controls['end_day'].setValue(1);
        }
      });

      this.helper.dissmissLoading();
      leaveFire.unsubscribe();
    });

  }

  getLeaveBalance(id, year) {

    this.authService.getLeaveBalance(id, year).subscribe(
      data => {

        if (data) {

          this.leaveBalances['al'] = data.data.al_balance;
          this.leaveBalances['el'] = data.data.al_balance;
          this.leaveBalances['sl'] = data.data.sl_balance;
          this.leaveBalances['hl'] = data.data.hl_balance;
          this.leaveBalances['ml'] = data.data.ml_balance;
          this.leaveBalances['pl'] = data.data.pl_balance;
          this.leaveBalances['cl'] = data.data.cl_balance;

          this.leaveBalanceAL = data.data.al_balance;
          this.leaveBalanceSL = data.data.sl_balance;
          this.leaveBalanceHL = data.data.hl_balance;
          this.leaveBalanceML = data.data.ml_balance;
          this.leaveBalancePL = data.data.pl_balance;
          this.leaveBalanceCL = data.data.cl_balance;
          console.log('getLeaveBalance', data.data);

          this.leaveBalance = data.data.al_balance;

          console.log('leaveBalances', data);

        }
      }, error => {
      });

  }

  getMyLeave(id) {

    this.firestore.collection('staff_leaves', ref => ref.where('staff.id', '==', Number(id))).snapshotChanges().subscribe((res) => {

      this.myLeaves = res.map((t) => {
        return {
          id: t.payload.doc.id,
          ...t.payload.doc.data() as Object
        };
      });

      console.log('myLeaves', this.myLeaves);
    });
  }

  async getLeave(id) {

    return this.authService.getLeave(id).subscribe(
      data => {

        console.log('get leave', data.data);
        const leave = data.data;
        if (data) {
          this.leave = leave;
          this.leaveForm.controls['type'].setValue(leave.leave_type);
          this.leaveForm.get('type').disable({ onlySelf: true });

          this.leaveForm.controls['start_date'].setValue(leave.start_date);
          this.leaveForm.controls['start_day'].setValue(Number(leave.start_day));
          this.leaveForm.get('start_day').disable({ onlySelf: true });

          this.leaveForm.controls['end_date'].setValue(leave.end_date);
          this.leaveForm.controls['end_day'].setValue(Number(leave.end_day));
          this.leaveForm.get('end_day').disable({ onlySelf: true });

          this.leaveForm.controls['reasons'].setValue(leave.reasons);
          this.leaveForm.controls['no_of_day'].setValue(leave.no_of_day);
          this.leaveImages = leave.attachments;

          console.log('date test', moment(data.start_date).format('YYYY-MM-DD'));

          this.getMyLeave(leave.staff_id);
          this.getLeaveBalance(leave.staff_id, moment().startOf('day').year());
        }
      }, error => {
      });

    // return this.firestore.collection('staff_leaves').doc(id).valueChanges().subscribe((data: any) => {

    //   console.log('leave', data);

    //   this.leave = data;
    //   if (data) {
    //     this.leaveForm.controls['type'].setValue(data.type.id);
    //     this.leaveForm.controls['start_day'].setValue(data.start_day);
    //     this.leaveForm.controls['end_day'].setValue(data.end_day);
    //     this.leaveForm.controls['reasons'].setValue(data.reasons);
    //     if (data.start_date) {
    //       this.leaveForm.controls['start_date'].setValue(moment(data.start_date.toDate()).format('YYYY-MM-DD'));
    //     }
    //     if (data.end_date) {
    //       this.leaveForm.controls['end_date'].setValue(moment(data.end_date.toDate()).format('YYYY-MM-DD'));
    //     }

    //     // this.leaveImages = data.leaveImages;
    //   }

    //   this.typeChange();
    // });
  }

  async getStaff() {
    const { value }: any = await Preferences.get({ key: 'staff' });
    this.currentStaff = JSON.parse(value);
    this.staff = JSON.parse(value);
    console.log(this.currentStaff);

  }

  editLeave() {
    this.is_edit = true;
  }

  cancelEditLeave() {
    this.is_edit = false;
  }

  typeChange() {
    const type = this.leaveForm.controls.type.value;

    switch (type) {
      case 'al':
        this.leaveBalance = this.leaveBalanceAL;
        break;
      case 'ul':
        this.leaveBalance = this.leaveBalanceUL;
        break;
      case 'sl':
        this.leaveBalance = this.leaveBalanceSL;
        break;
      case 'hl':
        this.leaveBalance = this.leaveBalanceHL;
        break;
      case 'pl':
        this.leaveBalance = this.leaveBalancePL;
        break;
      case 'ml':
        this.leaveBalance = this.leaveBalanceML;
        break;
      case 'el':
        this.leaveBalance = this.leaveBalanceAL;
        break;
      case 'cl':
        this.leaveBalance = this.leaveBalanceCL;
        break;
      default:
        this.leaveBalance = 0;
        break;
    }

    if (type == 'el') {
      const today = moment().startOf('day').format('YYYY-MM-DD');
      this.max_end_date = today;
    } else {
      const after5Days = moment(new Date().toISOString().split('T')[0]).add(5, 'days').format('YYYY-MM-DD');
      this.max_end_date = after5Days;
    }

    console.log('balance ' + type, this.leaveBalance);

    if (this.noReasonLeave.includes(this.leaveForm.controls.type.value)) {
      this.leaveForm.get('reasons').setValidators([]);
      this.leaveForm.get('reasons').setValue('');
    } else {
      this.leaveForm.get('reasons').setValidators([Validators.required]);
    }

    if (this.withImageLeave.includes(this.leaveForm.controls.type.value)) {
      this.withImage = true;
    } else {
      this.withImage = false;
    }

    this.leaveForm.get('reasons').updateValueAndValidity();

  }

  dateStartChange() {

    const start_date = this.leaveForm.get('start_date').value;

    console.log('start_date', start_date);

    if (!this.is_edit && (start_date > this.leaveForm.get('end_date').value)) {
      this.max_end_date = start_date;
      this.leaveForm.controls.end_date.setValue(start_date);
    } else if (!this.is_edit) {
      this.max_end_date = start_date;
    }

    const momentStart = moment(start_date, 'YYYY-MM-DD');
    const momentNow = moment().startOf('day');
    const daysDiff = momentStart.diff(momentNow, 'days') + 1;

    console.log('daysDiff', daysDiff);

    if (daysDiff <= 5) {
      this.types = this.types_firebase.filter((el) => el.code !== 'al');
      this.leaveForm.controls.type.setValue('el');
    } else {
      console.log('more than 5');
      this.types = this.types_firebase;
    }

    this.calculateTotalDay();
  }

  dateEndChange() {
    this.calculateTotalDay();
  }

  calculateTotalDay() {

    const start_date = this.leaveForm.get('start_date').value;
    const start_day = this.leaveForm.get('start_day').value;
    const end_date = this.leaveForm.get('end_date').value;
    const end_day = this.leaveForm.get('end_day').value;

    const a = moment(this.leaveForm.get('start_date').value).startOf('day');
    const b = moment(this.leaveForm.get('end_date').value).startOf('day');

    let total = b.diff(a, 'days') + 1;

    console.log('total', total);

    if (total == 1) {
      this.leaveForm.get('end_day').setValue(1);
      // this.leaveForm.get('end_day').disable();
    } else {
      this.leaveForm.get('end_day').enable();

      if (start_day == 2) {
        this.leaveForm.get('start_day').setValue(1);
      }
      if (end_day == 3) {
        this.leaveForm.get('end_day').setValue(1);
      }
    }

    if (total > 1 && this.leaveForm.get('end_day').value > 1) {
      total -= 0.5;
    }

    if (this.leaveForm.get('start_day').value > 1) {
      total -= 0.5;
    }

    this.leaveForm.get('no_of_day').setValue(total);
    this.totalDays = total;
  }

  async selectImageSource() {
    const buttons = [
      {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          this.takePicture();
        }
      },
      {
        text: 'Choose From Photos',
        icon: 'image',
        handler: () => {
          this.pickImage();
        }
      },
      {
        text: 'Files',
        icon: 'document',
        handler: () => {
          this.filePicker();
        }
      }
    ];

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      mode: 'ios',
      buttons
    });
    await actionSheet.present();
  }

  async pickImage() {

    const images = await this.helper.imagePicker();

    let index = 1;
    images.forEach(image => {

      const data = {
        id: Date.now(),
        file: image.file.original,
        file_thumbnail: image.file.thumbnail,
        url: image.webPath,
        format: image.format,
        type: 'image',
        name: Date.now() + '_picker_' + index,
      };

      this.leaveImages.push(data);

      index++;

    });
  }

  async takePicture() {
    const image = await this.helper.camera();

    const data = {
      id: Date.now(),
      file: image.file.original,
      file_thumbnail: image.file.thumbnail,
      url: image.webPath,
      format: image.format,
      type: 'image',
      name: Date.now() + '_camera'
    };

    this.leaveImages.push(data);

  }

  async filePicker() {

    const file = await this.helper.filePicker();

    if (file) {
      const data = {
        id: Date.now(),
        file: file.file,
        type: 'file',
        name: file.name
      };

      this.leaveImages.push(data);
    }

    return;
  }

  removeImage(index) {
    this.leaveImages.splice(index, 1);
  }

  async confirmSubmit(type) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm and submit application.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          },
        },
        {
          text: 'Submit',
          role: 'confirm',
          handler: () => {

            console.log('updateForm', type);


            if (type == 'add') {
              this.submitForm();
            } else {
              this.updateForm();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async submitForm() {

    if (this.withImage && this.leaveImages.length == 0) {
      this.helper.presentToast('Image or file proof is needed for this type of leave!');
      return;
    }

    this.helper.presentLoading();

    let data: any = {};
    data = this.leaveForm.value;
    data.date = new Date();
    data.status = 'pending';
    data.created_by = this.currentStaff.user_id;
    data.created_by_staff_id = this.currentStaff.staff_id;
    data.staff = this.currentStaff.staff ? this.currentStaff.staff : '';

    // console.log('start_date', data);
    // this.helper.dissmissLoading();
    // return;

    data.type = this.types.find(obj => obj.code == data.type);
    console.log('this.currentStaff', this.currentStaff);

    for (const leaveImage of this.leaveImages) {
      const upload = await this.helper.uploadToFirebase(leaveImage.file, data.reg_no);
      console.log('finish... report', upload.url);
      this.leaveImagesURL.push({
        name: leaveImage.name,
        image_link: upload.url,
        type: leaveImage.type,
      });
    }

    data.leaveImages = this.leaveImagesURL;

    this.authService.addStaffLeave(data).subscribe(
      result => {

        if (result.data) {
          console.log('result.data.id', result.data.id);

          if (data.start_date) {
            data.start_date = moment(data.start_date).startOf('day').toDate();
          }
          if (data.end_date) {
            data.end_date = moment(data.end_date).startOf('day').toDate();
          }

          this.firestore.collection('/staff_leaves/').doc('leave_' + result.data.id).set(data).then(() => {
            console.log('success');
            this.helper.presentToast('Leave successfully applied');
            this.navCtrl.back();
            this.helper.dissmissLoading();

          }).catch(error => {

            this.helper.presentToast('Sorry, there is some error occured.');
            this.helper.dissmissLoading();

          });
        } else {
          this.helper.presentToast('Leave successfully applied');
          this.navCtrl.back();
          this.helper.dissmissLoading();
        }

      }, error => {
        this.helper.dissmissLoading();
        console.log(error);
      });

  }

  async updateForm() {

    console.log('updateForm');

    if (this.withImage && this.leaveImages.length == 0) {
      this.helper.presentToast('Image or file proof is needed for this type of leave!');
      return;
    }

    this.helper.presentLoading();

    let data: any = {};
    data = this.leaveForm.value;

    console.log('form update', data);

    // if (data.start_date) {
    //   data.start_date = moment(data.start_date).local().startOf('day').toISOString();
    // }
    // if (data.end_date) {
    //   data.end_date = moment(data.end_date).local().startOf('day').toISOString();
    // }

    console.log('form update after', data);

    data.type = this.types.find(obj => obj.code == data.type);
    console.log('this.currentStaff', this.currentStaff);

    this.authService.updateStaffLeave(this.id, data).subscribe(
      result => {

        this.helper.presentToast('Leave successfully updated');
        this.navCtrl.back();
        this.helper.dissmissLoading();

      }, error => {
        this.helper.dissmissLoading();
        console.log(error);
      });

  }

  async updateFormOld() {

    this.helper.presentLoading();

    let data: any = {};
    data = this.leaveForm.value;
    data.date = new Date();
    data.status = 'pending';
    data.created_by = this.currentStaff.user_id;
    data.created_by_staff_id = this.currentStaff.staff_id;
    data.staff = this.currentStaff.staff ? this.currentStaff.staff : '';

    if (data.start_date) {
      data.start_date = moment(data.start_date).toDate();
    }
    if (data.end_date) {
      data.end_date = moment(data.end_date).toDate();
    }

    data.type = this.types.find(obj => obj.code == data.type);

    console.log('this.currentStaff', this.currentStaff);

    for (const leaveImage of this.leaveImages) {
      const upload = await this.helper.uploadToFirebase(leaveImage.file, data.reg_no);
      console.log('finish... report', upload.url);
      this.leaveImagesURL.push({
        name: leaveImage.name,
        image_link: upload.url,
        type: leaveImage.type,
      });
    }

    console.log('this.leave.leaveImages', this.leave.leaveImages);
    if (this.leave.leaveImages && this.leave.leaveImages.length > 0) {
      data.leaveImages = [...this.leave.leaveImages, ...this.leaveImagesURL];
    } else {
      data.leaveImages = this.leaveImagesURL;
    }

    // data.leaveImages = this.leaveImagesURL;

    this.firestore.doc('/staff_leaves/' + this.id).update(data).then(() => {
      console.log('success');
      this.helper.presentToast('Leave successfully updated');
      this.navCtrl.back();
      this.helper.dissmissLoading();

    }).catch(error => {

      this.helper.presentToast('Sorry, there is some error occured.');
      this.helper.dissmissLoading();

    });

  }

  async deleteLeave() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Are you sure want to delete?',
      message: 'This action will permanently delete the data.',
      mode: 'ios',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirm Cancel');
        }
      }, {
        text: 'Okay',
        handler: () => {

          this.helper.presentLoading();

          this.authService.deleteStaffLeave(this.id).subscribe(
            result => {

              this.helper.presentToast('Leave successfully deleted.');
              this.helper.dissmissLoading();
              this.navCtrl.back();

            }, error => {
              this.helper.presentToast('Sorry, there is some error occured.');
              this.helper.dissmissLoading();
            });

          // this.firestore.doc<any>('staff_leaves/' + this.id).delete().then(() => {
          //   console.log('success');
          //   this.helper.presentToast('Leave successfully deleted.');
          //   this.helper.dissmissLoading();
          //   this.navCtrl.back();

          // }).catch(error => {

          //   this.helper.presentToast('Sorry, there is some error occured.');
          //   this.helper.dissmissLoading();
          // });


        }
      }
      ]
    });

    await alert.present();
  }

  async updateStatus(status) {

    const text = (status == 'rejected') ? 'reject this?' : 'approve this?';

    const alert = await this.alertCtrl.create({
      header: 'Are you sure want to ' + text,
      mode: 'ios',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirm Cancel');
        }
      }, {
        text: 'Okay',
        handler: () => {

          this.helper.presentLoading();

          const params = {
            status,
            id: this.id,
            staff: this.currentStaff.staff_id,
            hr_comment: this.hr_comment,
          };

          this.authService.updateStaffLeave(this.id, params).subscribe(
            result => {

              this.firestore.doc<any>('staff_leaves/leave_' + this.id).update({
                status_changed_by: {
                  id: this.currentStaff.staff_id,
                  name: this.currentStaff.user_fullname,
                  date: new Date(),
                },
                status,
                status_remarks: this.hr_comment,
              }).then(() => {
                console.log('success');
                this.helper.presentToast('Leave status successfully updated.');
                this.helper.dissmissLoading();
                this.navCtrl.back();

              }).catch(error => {

                this.helper.presentToast('Sorry, there is some error occured.');
                this.helper.dissmissLoading();
              });

            }, error => {
              this.helper.dissmissLoading();
              console.log(error);
            });

        }
      }
      ]
    });

    await alert.present();
  }

  async changeStatusNotification(status) {

    const staff_id = this.staff.staff_id;
    const type = this.leaveForm.controls.type.value;
    const title = 'Your leave has been ' + status;
    const text = 'HR comment: ' + this.hr_comment;

    this.addNotification(staff_id, title, text);
  }

  async addSubmitFormNotification() {

    const staff_name = this.staff.staff.name;
    const staff_id = this.staff.staff_id;
    const type = this.leaveForm.controls.type.value;
    const typeName = this.leaveType[type];
    const title = staff_name + ' has applied ' + typeName + ' leave for ' + this.totalDays + ' ' + (this.totalDays > 1 ? 'days' : 'day');
    const text = 'Staff name: ' + staff_name + ', Leave type: ' + typeName;

    this.addNotification(staff_id, title, text);
  }

  async addNotification(staff_id, title, text) {

    const data = {
      title,
      body: 'Tap here to check it out!',
      text,
      user_id: 'staff_' + staff_id,
      data_add: new Date(),
    };

    await this.firestore.collection('/notifications/').add(data).then(() => {
      console.log('success');

    }).catch(error => {

      // this.helper.presentToast(error);

    });

  }
}

