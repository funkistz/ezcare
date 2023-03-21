import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router, NavigationExtras } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { HelperService } from '../../services/helper.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerPage implements OnInit {

  searchText = '';
  isSearched = false;
  isSearching = false;
  customers;
  status = 'unlogged';

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private helper: HelperService,
  ) { }

  ngOnInit() {
    this.getCustomers(this.status);
  }

  searchClaims(query) {

    this.isSearching = true;

    this.getCustomers(query);

  }

  changeStatus(event) {

    let status = event.detail.value;

    this.getCustomers(status);
  }

  async getCustomers(status, event = null) {

    this.isSearched = false;
    this.isSearching = true;
    this.customers = null;

    let staff_id;

    // console.log('search', status);

    this.authService.searchCustomer(status).subscribe(
      data => {

        this.isSearching = false;
        this.isSearched = true;

        if (data && data.data) {

          if (event) {
            event.target.complete();
          }

          if (data.data.length > 0) {
            this.customers = data.data;

            if (data.data.length < 1000) {
              console.log('customers', this.customers);
            }

          } else {
            this.customers = null;
          }
        }
      }, error => {

        this.isSearching = false;
        this.isSearched = true;

        console.log(error);
        if (event) {
          event.target.complete();
        }
      });
  }

  downloadFile() {

    console.log('downloadFile');

    const replacements = {
      'cust_ic': 'IC',
      'cust_name': 'Name',
      'cust_phone1': 'Phone',
      'cust_policyno': 'Policy No',
      'cust_vehicleregno': 'Reg No',
      'cust_vehicledesc': 'Vehicle',
      'dealer': 'Dealer',
      'branch': 'Branch',
      'last_login_at': 'Last Login At',
      'first_login_at': 'First Login At',
    };

    let data = [];

    this.customers.forEach(customer => {
      data.push({
        IC: customer.cust_ic,
        Name: customer.cust_name,
        Phone: customer.cust_phone1,
        'Policy No': customer.cust_policyno,
        'Reg No': customer.cust_vehicleregno,
        'Vehicle': customer.cust_vehicledesc,
        'Dealer': customer.dealer,
        'Branch': customer.branch,
        'Last Login At': customer.last_login_at,
        'First Login At': customer.first_login_at,
      });
    });

    const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    const csv = data.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(',')
    );
    csv.unshift(header.join(','));
    const csvArray = csv.join('\r\n');

    const a = document.createElement('a');
    const blob = new Blob([csvArray], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    console.log('url', url);

    a.href = url;
    a.download = 'myFile.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  // downloadCSV() {
  //   let csv = papa.unparse({
  //     fields: this.headerRow,
  //     data: this.csvData
  //   });

  //   // Dummy implementation for Desktop download purpose
  //   var blob = new Blob([csv]);
  //   var a = window.document.createElement("a");
  //   a.href = window.URL.createObjectURL(blob);
  //   a.download = "newdata.csv";
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // }

}
