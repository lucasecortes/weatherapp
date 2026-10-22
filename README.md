## WeatherAPI

The forecast is available at [http://localhost:3000/weather](http://localhost:3000/weather).
Create a WeatherAPI account and add your API key to `.env.local` in the project root:

```env
WEATHERAPI_KEY=your_api_key_here
```

Restart the development server after adding the key. The key is only used on the server and is
not exposed to the browser.

The API proxy also supports individual endpoints:

```text
/api/weather/current?q=Mendoza
/api/weather/forecast?q=Mendoza&days=3
/api/weather/search?q=Mendo
```