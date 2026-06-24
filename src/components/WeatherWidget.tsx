import { useEffect, useState } from 'react';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
}

function codeToEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '🌤';
  if (code <= 48) return '🌫';
  if (code <= 67) return '🌧';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦';
  if (code <= 86) return '🌨';
  return '⛈';
}

function codeToLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorm';
}

interface Props {
  coordinates: [number, number];
  bestSeason?: string;
}

export function WeatherWidget({ coordinates, bestSeason }: Props) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const [lng, lat] = coordinates;
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,weathercode,wind_speed_10m` +
      `&timezone=Asia%2FKolkata`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setData({
          temperature: Math.round(d.current.temperature_2m),
          windSpeed: Math.round(d.current.wind_speed_10m),
          weatherCode: d.current.weathercode,
        });
      })
      .catch(() => setError(true));
  }, [coordinates]);

  if (error) return null;

  return (
    <div className="weather-widget">
      {data ? (
        <>
          <span className="weather-widget__icon">{codeToEmoji(data.weatherCode)}</span>
          <span className="weather-widget__temp">{data.temperature}°C</span>
          <span className="weather-widget__sep">·</span>
          <span className="weather-widget__wind">{data.windSpeed} km/h</span>
          <span className="weather-widget__label">{codeToLabel(data.weatherCode)}</span>
          {bestSeason && (
            <span className="weather-widget__season">Best: {bestSeason}</span>
          )}
        </>
      ) : (
        <span className="weather-widget__skeleton" />
      )}
    </div>
  );
}
