import Image from "next/image";
import { ThemeToggle } from "../theme-toggle";

export const instant = false;

async function getForecast(location) {
  const apiKey = process.env.WEATHERAPI_KEY;

  if (!apiKey) {
    return { data: null, error: "Configura WEATHERAPI_KEY en el archivo .env.local." };
  }

  const params = new URLSearchParams({
    key: apiKey,
    q: location,
    days: "3",
    aqi: "yes",
    alerts: "yes",
  });

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?${params}`,
      { next: { revalidate: 300 } },
    );
    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.error?.message || "No se pudo obtener el pronóstico.",
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error("WeatherAPI forecast error:", error);
    return { data: null, error: "No se pudo conectar con el servicio del clima." };
  }
}

function SearchForm({ location }) {
  return (
    <form action="/weather" method="get" className="search-form">
      <label className="sr-only" htmlFor="weather-city">
        Buscar ciudad
      </label>
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input
        id="weather-city"
        name="q"
        defaultValue={location}
        placeholder="Busca una ciudad..."
      />
      <button type="submit" className="search-button">
        Buscar
      </button>
    </form>
  );
}

function WeatherHeader({ location }) {
  return (
    <header className="topbar">
      <a className="brand" href="/weather" aria-label="Clima, inicio">
        <span className="brand-mark" aria-hidden="true">☀</span>
        <span>cielo<span className="brand-accent">.</span></span>
      </a>
      <SearchForm location={location} />
      <ThemeToggle />
    </header>
  );
}

export default async function WeatherPage({ searchParams }) {
  const query = await searchParams;
  const location =
    typeof query.q === "string" && query.q.trim() ? query.q.trim() : "Mendoza";
  const { data, error } = await getForecast(location);

  if (error) {
    return (
      <main className="app-shell">
        <WeatherHeader location={location} />
        <section className="error-panel" role="alert">
          <span className="error-icon" aria-hidden="true">!</span>
          <div>
            <p className="eyebrow">No pudimos cargar el clima</p>
            <h1>Algo salió mal</h1>
            <p className="muted">{error}</p>
          </div>
        </section>
      </main>
    );
  }

  const { location: place, current, forecast, alerts } = data;
  const today = forecast.forecastday[0];
  const stats = [
    { icon: "💧", label: "Humedad", value: `${current.humidity}%`, note: "Humedad actual" },
    { icon: "💨", label: "Viento", value: `${current.wind_kph} km/h`, note: current.wind_dir },
    { icon: "☀️", label: "Índice UV", value: current.uv, note: "Nivel de radiación" },
    { icon: "🌡️", label: "Sensación", value: `${current.feelslike_c}°`, note: "Sensación térmica" },
  ];

  return (
    <main className="app-shell">
      <WeatherHeader location={place.name} />

      <section className="welcome-row">
        <div>
          <p className="eyebrow">TU CLIMA, DE UN VISTAZO</p>
          <h1>El tiempo en {place.name}</h1>
          <p className="muted">
            {place.country} <span className="dot-separator">·</span> Hora local {place.localtime}
          </p>
        </div>
        <span className="live-badge"><span /> Actualizado ahora</span>
      </section>

      <section className="current-card" aria-label="Clima actual">
        <div className="current-copy">
          <p className="current-location">AHORA EN {place.name.toUpperCase()}</p>
          <div className="temperature-row">
            <span className="temperature">{Math.round(current.temp_c)}°</span>
            <span className="temperature-unit">C</span>
          </div>
          <p className="current-condition">{current.condition.text}</p>
          <p className="feels-like">Sensación térmica de {Math.round(current.feelslike_c)}°</p>
        </div>
        <div className="current-art">
          <div className="sun-glow" />
          <Image
            src={`https:${current.condition.icon}`}
            alt={current.condition.text}
            width={128}
            height={128}
            priority
            unoptimized
          />
        </div>
        <div className="today-range">
          <span>Máx. <strong>{Math.round(today.day.maxtemp_c)}°</strong></span>
          <span className="range-track"><span /></span>
          <span>Mín. <strong>{Math.round(today.day.mintemp_c)}°</strong></span>
        </div>
      </section>

      <section className="section-block" aria-labelledby="details-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CONDICIONES</p>
            <h2 id="details-heading">Detalles del clima</h2>
          </div>
        </div>
        <div className="details-grid">
          {stats.map((stat) => (
            <article className="detail-card" key={stat.label}>
              <div className="detail-card-top">
                <span className="detail-icon" aria-hidden="true">{stat.icon}</span>
                <span className="detail-label">{stat.label}</span>
              </div>
              <p className="detail-value">{stat.value}</p>
              <p className="detail-note">{stat.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block" aria-labelledby="forecast-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LOS PRÓXIMOS DÍAS</p>
            <h2 id="forecast-heading">Pronóstico extendido</h2>
          </div>
          <span className="section-caption">3 días</span>
        </div>
        <div className="forecast-list">
          {forecast.forecastday.map((day, index) => (
            <article className={`forecast-card${index === 0 ? " forecast-today" : ""}`} key={day.date}>
              <div className="forecast-day">
                <span className="forecast-day-name">
                  {index === 0
                    ? "Hoy"
                    : new Date(`${day.date}T12:00:00Z`).toLocaleDateString("es-AR", {
                        weekday: "long",
                        timeZone: "UTC",
                      })}
                </span>
                <span className="forecast-date">
                  {new Date(`${day.date}T12:00:00Z`).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  })}
                </span>
              </div>
              <div className="forecast-condition">
                <Image
                  src={`https:${day.day.condition.icon}`}
                  alt={day.day.condition.text}
                  width={48}
                  height={48}
                  unoptimized
                />
                <span>{day.day.condition.text}</span>
              </div>
              <div className="forecast-rain">💧 {day.day.daily_chance_of_rain}%</div>
              <div className="forecast-temperatures">
                <strong>{Math.round(day.day.maxtemp_c)}°</strong>
                <span>{Math.round(day.day.mintemp_c)}°</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {alerts?.alert?.length > 0 && (
        <section className="weather-alert" aria-label="Alertas meteorológicas">
          <span className="alert-icon" aria-hidden="true">!</span>
          <div>
            <p className="eyebrow">AVISO METEOROLÓGICO</p>
            {alerts.alert.map((alert, index) => (
              <p className="alert-headline" key={`${alert.headline}-${index}`}>
                {alert.headline}
              </p>
            ))}
          </div>
        </section>
      )}

      <footer className="page-footer">
        <span>Datos meteorológicos de WeatherAPI</span>
        <span>Que tengas un buen día <span aria-hidden="true">✦</span></span>
      </footer>
    </main>
  );
}
