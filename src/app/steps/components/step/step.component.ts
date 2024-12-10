import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Step } from 'src/app/core/models/steps/step.model';
import { ModalUpdateStepComponent } from '../popups/modal-update-step/modal-update-step.component';

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss']
})
export class StepComponent {

  @Input() step!: Step;

  constructor(public dialog: MatDialog){
  }

  ngOnInit(){
    console.log("url image: ", this.step.imageUrl);
  }

  openModalUpdateInfosStep(): void {
    const dialogRef = this.dialog.open(ModalUpdateStepComponent, {
      data: {
        step: this.step
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // Si le résultat est défini, cela signifie que le projet a été ajouté
      if (result) {
      }
    });
  }

}
