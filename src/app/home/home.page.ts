import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../services/weather.service'; // Importa el servicio del clima
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx'; // Importa el plugin de geolocalización
import { Platform } from '@ionic/angular'; // Para asegurar que la plataforma esté lista antes de acceder a plugins

interface CarouselItem {
  title: string;
  description: string;
  image: string;
}

interface Card {
  image: string;
  title: string;
  subtitle: string;
  content: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  // Variables para el clima y predicciones
  weatherData: any = null;
  forecastData: any = null; // Para almacenar las predicciones del clima filtradas
  city: string = '';
  currentCityName: string = ''; // Nueva variable para mostrar la ciudad actual
  lat: number = 0;
  lon: number = 0;
  useCurrentLocation: boolean = true; // Variable para determinar si se usa geolocalización
  showWeatherSections: boolean = false; // Nueva propiedad para controlar la visibilidad

  showContent: boolean[] = []; // Array para controlar la visibilidad del contenido de las tarjetas

  // Opciones de configuración del slide
  slideOpts: { initialSlide: number; speed: number; autoplay: { delay: number } } = {
    initialSlide: 0,
    speed: 400,
    autoplay: {
      delay: 3000,
    },
  };

  // Datos para los items del carrusel
  items: CarouselItem[] = [
    { title: 'Item 1', description: 'Descripción del item 1', image: 'assets/img/carrusel1.jpg' },
    { title: 'Item 2', description: 'Descripción del item 2', image: 'assets/img/carrusel2.jpg' },
    { title: 'Item 3', description: 'Descripción del item 3', image: 'assets/img/carrusel3.jpg' },
  ];

  // Datos para las tarjetas
  cards: Card[] = [
    {
      image: 'assets/img/carrusel1.jpg',
      title: 'Card Title 1',
      subtitle: 'Card Subtitle 1',
      content: "Here's a small text description for the card content.",
    },
    {
      image: 'assets/img/carrusel2.jpg',
      title: 'Card Title 2',
      subtitle: 'Card Subtitle 2',
      content: "Here's a small text description for the card content.",
    },
    {
      image: 'assets/img/carrusel3.jpg',
      title: 'Card Title 3',
      subtitle: 'Card Subtitle 3',
      content: "Here's a small text description for the card content.",
    },
    {
      image: 'assets/img/foto1.jpg',
      title: 'Card Title 4',
      subtitle: 'Card Subtitle 4',
      content: "Here's a small text description for the card content.",
    },
  ];

  constructor(
    private weatherService: WeatherService,
    private geolocation: Geolocation,
    private platform: Platform
  ) {}

  ngOnInit() {
    console.log('HomePage inicializado');
    this.getCurrentLocationWeather(); // Obtener el clima de la ubicación actual al iniciar la app
    this.showContent = Array(this.cards.length).fill(false); // Inicializa showContent
  }

  toggleWeatherSections() {
    this.showWeatherSections = !this.showWeatherSections;
  }

  toggleContent(index: number) {
    this.showContent[index] = !this.showContent[index];
  }

  getCurrentLocationWeather() {
    this.platform.ready().then(() => {
      this.geolocation.getCurrentPosition().then((resp) => {
        this.lat = resp.coords.latitude;
        this.lon = resp.coords.longitude;
        this.getWeatherByLocation();
        this.getCityName(); // Obtener el nombre de la ciudad actual
      }).catch((error) => {
        console.error('Error al obtener la geolocalización', error);
      });
    });
  }

  getWeatherByLocation() {
    this.weatherService.getWeatherByCoordinates(this.lat, this.lon).subscribe(
      (data) => {
        this.weatherData = data;
        console.log('Datos del clima desde geolocalización:', data);
      },
      (error) => {
        console.error('Error al obtener los datos del clima por geolocalización:', error);
      }
    );

    this.weatherService.getForecastByCoordinates(this.lat, this.lon).subscribe(
      (forecast) => {
        this.forecastData = this.calculateDailyForecast(forecast.list);
        console.log('Predicciones del clima desde geolocalización:', this.forecastData);
      },
      (error) => {
        console.error('Error al obtener las predicciones del clima por geolocalización:', error);
      }
    );
  }

  getWeather() {
    if (this.city) {
      this.weatherService.getWeatherByCity(this.city).subscribe(
        (data) => {
          this.weatherData = data;
          console.log('Datos del clima por ciudad:', data);
        },
        (error) => {
          console.error('Error al obtener los datos del clima por ciudad:', error);
        }
      );

      this.weatherService.getForecastByCity(this.city).subscribe(
        (forecast) => {
          this.forecastData = this.calculateDailyForecast(forecast.list);
          console.log('Predicciones del clima por ciudad:', this.forecastData);
        },
        (error) => {
          console.error('Error al obtener las predicciones del clima por ciudad:', error);
        }
      );
    }
  }

  calculateDailyForecast(forecastList: any[]): any[] {
    const dailyForecast: any[] = [];
    const dayMap: { [key: string]: any[] } = {};

    forecastList.forEach((forecast: any) => {
      const date = new Date(forecast.dt_txt).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      if (!dayMap[date]) {
        dayMap[date] = [];
      }

      dayMap[date].push(forecast);
    });

    for (const date in dayMap) {
      const dayForecasts = dayMap[date];
      const minTemp = Math.min(...dayForecasts.map((f: any) => f.main.temp_min));
      const maxTemp = Math.max(...dayForecasts.map((f: any) => f.main.temp_max));

      dailyForecast.push({
        date,
        temp_min: minTemp,
        temp_max: maxTemp,
        description: dayForecasts[0].weather[0].description,
        icon: dayForecasts[0].weather[0].icon,
      });
    }

    return dailyForecast.slice(0, 5); // Limitar a 5 días
  }

  getCityName() {
    this.weatherService.getCityNameByCoordinates(this.lat, this.lon).subscribe(
      (data: any) => {
        if (data && data.length > 0) {
          this.city = data[0].name; // Asigna a 'city' para reflejarlo en la interfaz
          this.currentCityName = data[0].name;
          console.log('Ciudad actual:', this.city);
        }
      },
      (error) => {
        console.error('Error al obtener el nombre de la ciudad:', error);
      }
    );
  }
}
