export interface WeatherProvider {
  getCurrentWeather(lat: number, lon: number): Promise<any>;
}

export class PlaceholderWeatherProvider implements WeatherProvider {
  async getCurrentWeather(lat: number, lon: number): Promise<any> {
    throw new Error('Not implemented in Phase 0');
  }
}
