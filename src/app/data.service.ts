import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ERMessageDataset } from './model/message-dataset';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  //private DATA_BASE_URL = "http://localhost:4200/assets/elden-ring-data/";
  private DATA_BASE_URL = "https://raw.githubusercontent.com/elden-ring-playground/elden-ring-data/main/";

  constructor(private http: HttpClient) { }

  public getItemMessages(): Observable<ERMessageDataset> {
    //return this.http.get(this.DATA_BASE_URL + "combined/msg-item.json");
    return this.http.get<ERMessageDataset>(this.DATA_BASE_URL + "msg/engus/item.msgbnd.dcx.json");
  }

  public getMenuMessages(): Observable<ERMessageDataset> {
    //return this.http.get(this.DATA_BASE_URL + "combined/msg-menu.json");
    return this.http.get<ERMessageDataset>(this.DATA_BASE_URL + "msg/engus/menu.msgbnd.dcx.json");
  }

}
