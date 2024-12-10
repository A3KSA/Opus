import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarState = new BehaviorSubject<boolean>(false);
  sidebarState$ = this.sidebarState.asObservable();

  private columnState = new BehaviorSubject<boolean>(false);
  columnState$ = this.columnState.asObservable();

  toggleSidebar() {
    console.log("toggleSidebar");
    this.sidebarState.next(!this.sidebarState.value);
  }

  setSidebarState(state: boolean) {
    console.log("nouvel état du menu: ", state);
    this.sidebarState.next(state);
  }
}
