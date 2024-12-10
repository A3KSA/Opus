import { ChangeDetectorRef, Component, ElementRef, NgZone, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { SidebarService } from 'src/app/core/services/sidebar.service';

@Component({
  selector: 'app-new-navigation-bar',
  templateUrl: './new-navigation-bar.component.html',
  styleUrls: ['./new-navigation-bar.component.scss']
})
export class NewNavigationBarComponent {

  myScriptElement!: HTMLScriptElement;
  menuActive: boolean = false;
  private sidebarSubscription!: Subscription;
  isMobileWidth!: boolean;

  constructor(private sidebarService: SidebarService, private cd: ChangeDetectorRef, private ngZone: NgZone,  private renderer: Renderer2,
    private el: ElementRef){
     //PERMET D'IMPORTER UN SCRIPT JS DIRECTEMENT DANS UN COMPOSANT
     this.myScriptElement = document.createElement("script");
     this.myScriptElement.src = "../assets/js/navbar-script.js";
     document.body.appendChild(this.myScriptElement);
  }

  ngOnInit() {
    this.sidebarSubscription = this.sidebarService.sidebarState$.subscribe(state => {
      this.menuActive = state;
      this.cd.detectChanges(); // Force la détection des changements
      this.updateClasses();
    });
  }

  closeMenu() {
    this.ngZone.run(() => {
      this.sidebarService.setSidebarState(false);
      setTimeout(() => {
       this.updateClasses();
      }, 0);
    });
  }

  ngOnDestroy() {
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
  }

  updateClasses() {
    const sidebarElement = this.el.nativeElement.querySelector('.sidebar');
    if (this.menuActive) {
      this.renderer.removeClass(sidebarElement, 'close');
      this.renderer.addClass(sidebarElement, 'active');
      //console.log('Added class active, removed class close');
    } else {
      this.renderer.removeClass(sidebarElement, 'active');
      this.renderer.addClass(sidebarElement, 'close');
      //console.log('Added class close, removed class active');
    }
    this.cd.detectChanges();
  }
}
