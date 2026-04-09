const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { buildPlainTextFromAddressComponents } = require('../utils/placeLocationPlainText');

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';

const GEO_PRIMARY_TYPES = [
  'locality',
  'administrative_area_level_2',
  'administrative_area_level_1',
  'country',
];

function getApiKey() {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';
}

exports.getStatus = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { enabled: Boolean(getApiKey()) },
  });
});

exports.autocomplete = catchAsync(async (req, res, next) => {
  const key = getApiKey();
  if (!key) {
    return next(new AppError('Places search is not configured', 503));
  }

  const rawInput = req.body?.input;
  const sessionToken = typeof req.body?.sessionToken === 'string' ? req.body.sessionToken.trim() : '';
  const input = typeof rawInput === 'string' ? rawInput.trim() : '';

  if (!input || input.length < 2) {
    return next(new AppError('input must be at least 2 characters', 400));
  }
  if (input.length > 200) {
    return next(new AppError('input is too long', 400));
  }

  try {
    const { data } = await axios.post(
      AUTOCOMPLETE_URL,
      {
        input,
        includedPrimaryTypes: GEO_PRIMARY_TYPES,
        languageCode: 'en',
        ...(sessionToken ? { sessionToken } : {}),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask':
            'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
        },
        timeout: 10000,
      }
    );

    const suggestions = (data.suggestions || [])
      .map((s) => {
        const p = s.placePrediction;
        const placeId =
          p?.placeId ||
          (typeof p?.place === 'string' ? p.place.replace(/^places\//, '') : '') ||
          '';
        if (!placeId) return null;
        const main = p.structuredFormat?.mainText?.text || p.text?.text || '';
        const sec = p.structuredFormat?.secondaryText?.text || '';
        return {
          placeId,
          label: sec ? `${main}, ${sec}` : main || placeId,
        };
      })
      .filter(Boolean);

    res.status(200).json({ status: 'success', results: suggestions.length, data: { suggestions } });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message || 'Places request failed';
    return next(new AppError(msg, 502));
  }
});

exports.resolvePlace = catchAsync(async (req, res, next) => {
  const key = getApiKey();
  if (!key) {
    return next(new AppError('Places search is not configured', 503));
  }

  const placeId = typeof req.body?.placeId === 'string' ? req.body.placeId.trim() : '';
  const sessionToken = typeof req.body?.sessionToken === 'string' ? req.body.sessionToken.trim() : '';

  if (!placeId) {
    return next(new AppError('placeId is required', 400));
  }

  const encodedId = encodeURIComponent(placeId);
  const url = `https://places.googleapis.com/v1/places/${encodedId}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'addressComponents,displayName',
      },
      params: sessionToken ? { sessionToken } : {},
      timeout: 10000,
    });

    const plainText = buildPlainTextFromAddressComponents(data.addressComponents);
    if (!plainText) {
      return next(
        new AppError('Could not build a location from this place (try another result)', 422)
      );
    }

    res.status(200).json({
      status: 'success',
      data: { plainText },
    });
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message || 'Place details failed';
    if (status === 404) {
      return next(new AppError('Place not found', 404));
    }
    return next(new AppError(msg, 502));
  }
});
