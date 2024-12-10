import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnteteRapport } from 'src/app/core/models/projets/enteteRapport.model';
import { LogService } from 'src/app/core/services/log.service';

@Component({
  selector: 'app-generate-email',
  templateUrl: './generate-email.component.html',
  styleUrls: ['./generate-email.component.scss']
})
export class GenerateEmailComponent {
  selectedFile: File | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public logger: LogService, private dialogRef: MatDialogRef<GenerateEmailComponent>) {
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  /**
   * Fonction qui permet de générer un fichier .EML qui génère un fichier traitable par Outlook
   * @returns 
   */
  genererEML() {
    if (!this.selectedFile) {
      alert('Veuillez sélectionner un fichier à attacher.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (loadEvent: any) => {
      // À ce stade, TypeScript sait que selectedFile ne peut pas être null,
      // mais pour accéder à selectedFile.name de manière sûre, utilisez une vérification supplémentaire ou l'opérateur !.
      const base64Content = loadEvent.target.result.split(',')[1]; // Enlève le préfixe MIME type
      const emailTo = this.data.listEntetes.map((element: EnteteRapport) => element.emailResponsable).join(", ");
      const emailSubject = "" + this.data.projectId + '_' + this.data.projectTitre + '_' + this.data.nomDocument + "_";
      const htmlDocument = "Ci-joint le procès-verbal concernant notre séance du " + this.formatDate(this.data.dateSeance) + "."; // Votre contenu HTML
  
      let emlContent = `To: ${emailTo}\n`;
      emlContent += `Subject: ${emailSubject}\n`;
      emlContent += 'X-Unsent: 1\n';
      emlContent += 'Content-Type: multipart/mixed; boundary="boundary"\n\n';
      
      emlContent += '--boundary\n';
      emlContent += 'Content-Type: text/html; charset=utf-8\n\n';
      emlContent += htmlDocument + '\n';
      emlContent += '--boundary\n';
      emlContent += `Content-Type: application/octet-stream; name="${this.selectedFile!.name}"\n`; // L'utilisation de ! indique à TypeScript que vous êtes sûr que selectedFile n'est pas null.
      emlContent += 'Content-Transfer-Encoding: base64\n';
      emlContent += `Content-Disposition: attachment; filename="${this.selectedFile!.name}"\n\n`; // Idem ici.
      emlContent += base64Content + '\n';
      emlContent += '--boundary--';
  
      const blob = new Blob([emlContent], { type: 'message/rfc822' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email.eml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
  
    reader.readAsDataURL(this.selectedFile);
  }

  /**
 * Fonction pour transformer une date format machine en un format plus lisible.
 * @param dateString 
 * @returns nouvelle date formattée.
 */
  formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', options);
  }
}
