import { Router, Request, Response } from 'express';

export const placesRouter = Router();

// Address Search & Places Autocomplete API
placesRouter.get('/places/autocomplete', async (req: Request, res: Response) => {
  try {
    const query = (req.query.input as string) || '';
    const mapsApiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY;

    if (mapsApiKey && query.length >= 2) {
      const placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&key=${mapsApiKey}`;
      const placesRes = await fetch(placesUrl);
      const data = await placesRes.json();

      if (data.status === 'OK' && data.predictions) {
        res.json({ predictions: data.predictions });
        return;
      }
    }

    const fallbackLocations = [
      { description: 'Near Diamond Point, Bowenpally, Secunderabad, Hyderabad, Telangana 500011', place_id: 'hyd-bowenpally' },
      { description: 'Suchitra Junction, Medchal Highway, Hyderabad, Telangana 500067', place_id: 'hyd-suchitra' },
      { description: 'Main Road, Kompally, Hyderabad, Telangana 500100', place_id: 'hyd-kompally' },
      { description: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038', place_id: 'blr-ind-100' },
      { description: 'HSR Layout Sector 1, 27th Main Road, Bengaluru, Karnataka 560102', place_id: 'blr-hsr-1' },
      { description: '14 Mount Street, Mayfair, London W1K 2RF', place_id: 'lon-mayfair' },
      { description: '88 Old Brompton Rd, Kensington, SW7 3LQ', place_id: 'lon-kensington' },
    ];

    const filtered = query
      ? fallbackLocations.filter((item) => item.description.toLowerCase().includes(query.toLowerCase()))
      : fallbackLocations;

    res.json({ predictions: filtered });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch places autocomplete', details: err?.message });
  }
});

// Geolocation & Reverse Geocode API
placesRouter.post('/location/geocode', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.body;
    const mapsApiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY;

    if (mapsApiKey && lat && lng) {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${mapsApiKey}`;
      const geoRes = await fetch(geocodeUrl);
      const data = await geoRes.json();

      if (data.status === 'OK' && data.results?.[0]) {
        res.json({ address: data.results[0].formatted_address });
        return;
      }
    }

    res.json({
      address: `Near Diamond Point, Bowenpally, Secunderabad, Hyderabad, Telangana 500011`,
      lat: lat || 17.4720,
      lng: lng || 78.4820,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Geocoding failed', details: err?.message });
  }
});
