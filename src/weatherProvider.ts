import type { WeatherSnapshot } from './types';

const mockConditions = [
  { condition: 'cloudy', summary: 'Soft gray sky with a light breeze', temp: 68, feels: 66, humidity: 72, wind: 8 },
  { condition: 'sunny', summary: 'Bright and dry with warm afternoon sun', temp: 78, feels: 80, humidity: 45, wind: 5 },
  { condition: 'rainy', summary: 'Passing showers and damp sidewalks', temp: 61, feels: 58, humidity: 88, wind: 10 },
  { condition: 'windy', summary: 'Gusty but clear enough for errands', temp: 55, feels: 49, humidity: 50, wind: 18 },
] as const;

export async function getCurrentWeather(): Promise<WeatherSnapshot> {
  const now = new Date();
  const pick = mockConditions[now.getHours() % mockConditions.length];

  return {
    provider: 'mock',
    capturedAt: now.toISOString(),
    locationName: 'Mock neighborhood',
    temperatureF: pick.temp,
    feelsLikeF: pick.feels,
    condition: pick.condition,
    humidity: pick.humidity,
    windMph: pick.wind,
    summary: pick.summary,
  };
}
