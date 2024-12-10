import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { STEPService } from 'src/app/core/services/step.service';

@Component({
  selector: 'app-note-item',
  templateUrl: './note-item.component.html',
  styleUrls: ['./note-item.component.scss']
})
export class NoteItemComponent {
  @Input() note: any;
  isExpanded = false;
  @ViewChild('content') content!: ElementRef;

  constructor(private el: ElementRef, private stepService: STEPService) { }

  ngAfterViewInit() {
    this.content.nativeElement.style.height = '0px';
  }

  deleteCurrentNote() {
    const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?");
    if (userConfirmed) {
      this.stepService.deleteSpecificNote(this.note.PK_Information).subscribe(
        response => {
          this.stepService.deleteNote(this.note.PK_Information);
        },
        error => {
          console.error('Erreur lors de la suppression de la note', error);
        }
      );
    } else {
      console.log("Suppression annulée par l'utilisateur.");
    }
  }

  openEditNoteModal() {
  }

  toggleContent() {
    this.isExpanded = !this.isExpanded;
    const contentElement = this.content.nativeElement;
    if (this.isExpanded) {
      contentElement.style.height = `${contentElement.scrollHeight}px`;
    } else {
      contentElement.style.height = '0px';
    }
  }


}
