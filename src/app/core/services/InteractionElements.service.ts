import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InteractionElementsService {
  private sliderMoveSubject = new Subject<boolean>();
  sliderMove$ = this.sliderMoveSubject.asObservable();

  notifySliderMove(moved: boolean) {
    this.sliderMoveSubject.next(moved);
  }
}