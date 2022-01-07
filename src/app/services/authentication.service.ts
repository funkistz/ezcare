import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  // url = 'https://funkistz.site/api/';
  url = 'https://ezcare.local:8890/api/';
  header;

  constructor(
    private http: HttpClient
  ) {
    this.header = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + btoa("funkistzgm@gmail.com:ug8YVi3t67"),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'rejectUnauthorized': 'false',
      })
    };
  }

  login(credentials: { registration_number, policy_number }): Observable<any> {

    return this.http.post(this.url + 'loginCustomer', credentials, this.header);

    // return this.http.post(this.url, credentials).pipe(
    //   map((data: any) => data.token),
    //   switchMap(token => {
    //     return;
    //     // return from(
    //     //   Storage.set({ key: TOKEN_KEY, value: token })
    //     // );
    //   }),
    //   tap(_ => {
    //     this.isAuthenticated.next(true);
    //   })
    // )
  }

  loginStaff(credentials: { username, password }): Observable<any> {

    return this.http.post(this.url + 'loginStaff', credentials, this.header);
  }

  getServices(policy_id): Observable<any> {

    let params = new HttpParams().set('policy_id', policy_id);
    this.header.params = params;

    return this.http.get(this.url + 'service', this.header);

  }

  getService(service_id): Observable<any> {

    return this.http.get(this.url + 'service/' + service_id, this.header);

  }

  searchServices(search): Observable<any> {

    let params = new HttpParams().set('search', search);
    this.header.params = params;

    return this.http.get(this.url + 'service', this.header);

  }

  getPoliciesByIC(cust_ic): Observable<any> {

    let params = new HttpParams().set('customer_ic', cust_ic);
    this.header.params = params;

    return this.http.get(this.url + 'policy', this.header);

  }

  getClaims(policy_id): Observable<any> {

    let params = new HttpParams().set('policy_id', policy_id);
    this.header.params = params;

    return this.http.get(this.url + 'claim', this.header);

  }

  getClaim(claim_id): Observable<any> {

    // let params = new HttpParams().set('claim_id', claim_id);
    // this.header.params = params;

    return this.http.get(this.url + 'claim/' + claim_id, this.header);

  }

  searchClaims(search, exact = false): Observable<any> {

    let params = new HttpParams().set('search', search).set('exact', exact);

    if (!exact) {
      params = new HttpParams().set('search', search);
    }

    this.header.params = params;

    return this.http.get(this.url + 'claim', this.header);

  }

  addService(data): Observable<any> {

    return this.http.post(this.url + 'service', data, this.header);

  }

  addClaim(data): Observable<any> {

    // let params = new HttpParams().set('image', data);
    // this.header.params = params;

    return this.http.post(this.url + 'claim', data, this.header);

  }

  updateClaim(claim_id, data) {

    return this.http.put(this.url + 'claim/' + claim_id, data, this.header);

  }

  updateClaimAttachment(claim_id, data, type) {

    return this.http.post(this.url + 'claim/' + type, data, this.header);

  }

  uploadImage(image) {

    const formData = new FormData();
    formData.append('image', image.blobData, `myimage.${image.format}`);
    // formData.append('name', name);

    return this.http.post(this.url + 'claim', formData, this.header);
  }

  getStaffs() {

    return this.http.get(this.url + 'claim/staffs', this.header);

  }

  getGenerals(): Observable<any> {

    return this.http.get(this.url + 'claim/general', this.header);
  }

  getReports(user_id): Observable<any> {

    let params = new HttpParams().set('user_id', user_id);
    this.header.params = params;

    return this.http.get(this.url + 'policy/report', this.header);

  }

  updateClaimStatus(data): Observable<any> {

    return this.http.post(this.url + 'claim/updateStatus', data, this.header);

  }

  getWorkshops(): Observable<any> {

    return this.http.get(this.url + 'workshop', this.header);
  }

  searchWorkshops(search): Observable<any> {

    let params = new HttpParams().set('search', search);
    this.header.params = params;

    return this.http.get(this.url + 'workshop', this.header);
  }

  // logout(): Promise<void> {
  //   this.isAuthenticated.next(false);
  //   // return Storage.remove({ key: TOKEN_KEY });
  // }
}
