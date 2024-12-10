import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-article-item',
  templateUrl: './article-item.component.html',
  styleUrls: ['./article-item.component.scss']
})
export class ArticleItemComponent {
  @Input() article: any;

  ngOnInit(){
    console.log(this.article)
  }

  formatDate(dateInput: string | (string | null)[]): string {
    let dateString: string | null;

    if (Array.isArray(dateInput)) {
      dateString = dateInput.find(date => date !== null) || null;
    } else {
      dateString = dateInput;
    }

    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  addPopularity(){
    
  }

}
