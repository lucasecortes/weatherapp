const WEATHERAPI_BASE_URL = "https://api.weatherapi.com/v1";

const ALLOWED_ENDPOINTS = new Set([
  "current",
  "forecast",
  "history",
  "astronomy",
  "search",
  "ip",
  "timezone",
  "marine",
  "sports",
]);

export async function GET(request, { params }) {
  const { endpoint } = await params;

  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return Response.json({ error: `Unknown endpoint: ${endpoint}` }, { status: 404 });
  }

  const apiKey = process.env.WEATHERAPI_KEY;

  if (!apiKey) {
    console.error("WEATHERAPI_KEY is not configured");
    return Response.json({ error: "Weather service is not configured" }, { status: 500 });
  }

  const weatherUrl = new URL(`${WEATHERAPI_BASE_URL}/${endpoint}.json`);
  new URL(request.url).searchParams.forEach((value, key) => {
    weatherUrl.searchParams.append(key, value);
  });
  weatherUrl.searchParams.set("key", apiKey);

  try {
    const response = await fetch(weatherUrl, { next: { revalidate: 300 } });
    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error: data.error?.message || "WeatherAPI request failed",
          code: data.error?.code,
        },
        { status: response.status },
      );
    }

    return Response.json(data, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("WeatherAPI proxy error:", error);
    return Response.json({ error: "Unable to contact the weather service" }, { status: 502 });
  }
}
