export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'cold' | 'stormy';

export interface WeatherSnapshot {
  provider: 'mock';
  capturedAt: string;
  locationName: string;
  temperatureF: number;
  feelsLikeF: number;
  condition: WeatherCondition;
  humidity: number;
  windMph: number;
  summary: string;
}

export interface WeatherLog {
  id: string;
  createdAt: string;
  weather: WeatherSnapshot;
  outfit: string;
  feeling: string;
  comfortLevel: 1 | 2 | 3 | 4 | 5;
  wishedFor: string;
  notes: string;
}

export interface ExportFile {
  app: 'MwenWeather';
  version: 1;
  exportedAt: string;
  logs: WeatherLog[];
}
