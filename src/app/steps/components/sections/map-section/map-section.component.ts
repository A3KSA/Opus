import { Component, ElementRef, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-map-section',
  templateUrl: './map-section.component.html',
  styleUrls: ['./map-section.component.scss']
})
export class MapSectionComponent {
  
  @Input() latitude!: number; // Valeur par défaut
  @Input() longitude!: number; // Valeur par défaut

  private map!: google.maps.Map;
  private marker!: google.maps.Marker;

  isSatelliteView = false;
  
  constructor(private elementRef: ElementRef) {
  }

  ngOnInit() {
    this.initMap();
    this.updateMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['latitude'] || changes['longitude']) {
      this.updateMap();
    }
  }

  initMap(): void {
    console.log("initMap called");
    // Le code de l'initialisation de la carte Google Maps va être ajouté ici
    const mapContainer = document.getElementById('map') as HTMLElement;
    const uluru = { lat: this.latitude, lng: this.longitude };
    this.map = new google.maps.Map(
      mapContainer,
      {
        zoom: 17,
        center: uluru,
        mapTypeId: 'satellite'
      }
    );
    this.marker = new google.maps.Marker({
      position: uluru,
      map: this.map,
      title: "STEP",
      animation: google.maps.Animation.DROP
    });
  }

  private updateMap(): void {
    const newLocation = new google.maps.LatLng(this.latitude, this.longitude);
    console.log(this.latitude, this.longitude);
    console.log(newLocation);
    this.map.setCenter(newLocation);
    this.marker.setPosition(newLocation);
  }
}
