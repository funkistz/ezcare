import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Apiv2Service {

  url = 'https://www.systemid.ezcare-warranty.com/api/';
  // url = 'http://127.0.0.1:8000/api/';

  constructor(
    private http: HttpClient
  ) { }

  get(url, params: any): Observable<any> {

    return this.http.get(this.url + url, params);

  }

  post(url, params: any): Observable<any> {

    return this.http.post(this.url + url, params);

  }

  put(url, params: any): Observable<any> {

    return this.http.put(this.url + url, params);

  }
}
