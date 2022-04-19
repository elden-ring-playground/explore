import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  //private DATA_BASE_URL = "http://localhost:4200/assets/elden-ring-data/";
  private DATA_BASE_URL = "https://raw.githubusercontent.com/elden-ring-playground/elden-ring-data/main/";

  constructor(private http: HttpClient) { }

  public getItemMessages() {
    return this.http.get(this.DATA_BASE_URL + "combined/msg-item.json");
  }

  public getMenuMessages() {
    return this.http.get(this.DATA_BASE_URL + "combined/msg-menu.json");
  }

}
