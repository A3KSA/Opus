import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WIKI_ArticleService } from 'src/app/core/services/wiki/article.service';


@Component({
  selector: 'app-new-article',
  templateUrl: './new-article.component.html',
  styleUrls: ['./new-article.component.scss']
})
export class NewArticleComponent {
  public editorConfig = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'script': 'sub'}, { 'script': 'super' }], // Ajoute les options de subscript et superscript
      [{ 'size': ['small', false, 'large', 'huge'] }], // Ajoute les options de taille de police
      [{ 'color': [] }, { 'background': [] }], // Ajoute les options de couleur de texte et de fond
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['image'],
      ['clean']  // remove formatting button
    ],
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  };
  
  tags: any[] = []; // Stocker les objets de tag complets
  categories: any[] = []; // Stocker les objets de catégorie complets
  selectedCategorie: any; // Stocker l'objet de catégorie sélectionné
  selectedTags: any[] = []; // Stocker les tags sélectionnés

  tagsString: string = '';
  showPopupTag: boolean = false;

  public article = {
    id: '',
    title: '',
    content: '',
    contentHtml: '',
    createdDate: '',
    modifiedDate:'',
    fkCategorie: '',
    fkAuthor: '1', // Exemple d'ID d'auteur, à remplacer par une valeur réelle
    tags: [] as (number | { name: string })[]
  };

  constructor(private articleService: WIKI_ArticleService, private router: Router,) { 
    const currentDate = new Date();
    this.article.createdDate = currentDate.toISOString();
  }

  ngOnInit(){
    this.articleService.getAllCategories().subscribe(
      data => {
        this.categories = data; // Stocker les objets complets
      },
      error => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
    this.articleService.getAllTags().subscribe(
      data => {
        this.tags = data;
      },
      error => {
        console.error(error);
        // Gérez l'erreur si nécessaire
      }
    );
  }

  updateContent(event: any): void {
    this.article.content = event.text;
    this.article.contentHtml = event.html;
  }

  saveArticle(): void {
    this.article.modifiedDate = new Date().toISOString();
    this.article.fkCategorie = this.selectedCategorie.PK_Categorie;

    this.article.tags = this.selectedTags.map(tag => {
      const existingTag = this.tags.find(t => t.Name === tag);
      return existingTag ? existingTag.PK_Tag : { name: tag }; // Remplacez PK_Tag par le nom de votre clé primaire
    });
    
    // Sauvegarder l'article d'abord
    this.articleService.saveNewArticle(this.article).subscribe(response => {
      this.article.id = response.id; // Mettre à jour l'ID de l'article après la sauvegarde
      console.log('Article saved', response);

      // Extraire les images du contenu HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(this.article.contentHtml, 'text/html');
      const images = doc.getElementsByTagName('img');

      // Uploader chaque image avec l'ID de l'article
      const imageUploadPromises = Array.from(images).map(img => {
        return fetch(img.src)
          .then(res => res.blob())
          .then(blob => new File([blob], 'image.jpg', { type: blob.type }))
          .then(file => this.articleService.uploadImageArticle(file, this.article.id).toPromise())
          .then(response => {
            img.src = response.url; // Mettre à jour l'URL de l'image dans le contenu HTML
          });
      });

      // Attendre que toutes les images soient uploadées
      Promise.all(imageUploadPromises).then(() => {
        console.log('All images uploaded');
      });
    });
    this.router.navigate(['/wiki']);
  }

  togglePopupTag(): void {
    this.showPopupTag = !this.showPopupTag;
  }

  onTagChange(event: any) {
    const tag = event.target.value;
    if (event.target.checked) {
      this.selectedTags.push(tag);
    } else {
      const index = this.selectedTags.indexOf(tag);
      if (index > -1) {
        this.selectedTags.splice(index, 1);
      }
    }
  }

  updateTagsString(): void {
    this.tagsString = this.selectedTags.join(', ');
  }

  removeTag(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    }
  }

onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const input = event.target as HTMLInputElement;
      const newTag = input.value.trim();
      if (newTag && !this.selectedTags.includes(newTag)) {
        this.selectedTags.push(newTag);
      }
      input.value = '';
    }
  }
}
