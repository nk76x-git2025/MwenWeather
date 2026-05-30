import type { WeatherLog } from './types';

export interface Recommendation {
  title: string;
  detail: string;
  evidence: WeatherLog[];
}

export function getRecommendation(logs: WeatherLog[]): Recommendation {
  if (logs.length === 0) {
    return {
      title: 'Start with today’s outfit memory',
      detail: 'Save a few logs and MwenWeather will explain suggestions from your own history.',
      evidence: [],
    };
  }

  const uncomfortable = logs.filter((log) => log.comfortLevel <= 2);
  const evidence = (uncomfortable.length > 0 ? uncomfortable : logs).slice(0, 3);
  const wishedFor = evidence.map((log) => log.wishedFor.trim()).filter(Boolean);

  return {
    title: wishedFor.length > 0 ? `Consider: ${wishedFor[0]}` : 'Dress from your most comfortable similar day',
    detail:
      uncomfortable.length > 0
        ? 'This is based on past low-comfort logs, especially days where you wrote what you wished you had brought.'
        : 'This is based on your most recent logs until there are more low-comfort patterns to learn from.',
    evidence,
  };
}
