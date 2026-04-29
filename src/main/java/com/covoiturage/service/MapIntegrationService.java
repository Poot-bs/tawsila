package com.covoiturage.service;

import com.covoiturage.dto.MapGeocodeResult;
import com.covoiturage.dto.MapRouteResponse;
import com.covoiturage.exception.ValidationException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class MapIntegrationService {
    private static final String NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
    private static final String OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving";

    private final RestTemplate restTemplate = new RestTemplate();

    public List<MapGeocodeResult> geocode(String query) {
        if (isBlank(query)) {
            throw new ValidationException("Le parametre query est obligatoire");
        }

        URI uri = UriComponentsBuilder.fromHttpUrl(NOMINATIM_BASE_URL)
            .queryParam("q", query.trim())
            .queryParam("format", "jsonv2")
            .queryParam("limit", 5)
            .build(true)
            .toUri();

        HttpEntity<Void> entity = new HttpEntity<>(buildHeaders());
        ResponseEntity<List> response = restTemplate.exchange(uri, HttpMethod.GET, entity, List.class);
        List<?> rows = response.getBody();
        if (rows == null) {
            return List.of();
        }

        List<MapGeocodeResult> results = new ArrayList<>();
        for (Object row : rows) {
            if (!(row instanceof Map<?, ?> rowMap)) {
                continue;
            }
            Object displayName = rowMap.get("display_name");
            String label = String.valueOf(displayName != null ? displayName : query.trim());
            double lat = parseDouble(rowMap.get("lat"));
            double lng = parseDouble(rowMap.get("lon"));
            results.add(new MapGeocodeResult(label, lat, lng));
        }
        return results;
    }

    public MapRouteResponse route(String from, String to) {
        if (isBlank(from) || isBlank(to)) {
            throw new ValidationException("Les parametres from et to sont obligatoires");
        }

        MapGeocodeResult fromPoint = geocode(from).stream().findFirst()
            .orElseThrow(() -> new ValidationException("Depart introuvable sur la carte"));
        MapGeocodeResult toPoint = geocode(to).stream().findFirst()
            .orElseThrow(() -> new ValidationException("Destination introuvable sur la carte"));

        String coordinates = fromPoint.getLng() + "," + fromPoint.getLat() + ";" + toPoint.getLng() + "," + toPoint.getLat();
        URI uri = UriComponentsBuilder.fromHttpUrl(OSRM_BASE_URL + "/" + coordinates)
            .queryParam("overview", "full")
            .queryParam("geometries", "geojson")
            .build(true)
            .toUri();

        ResponseEntity<Map> response = restTemplate.exchange(uri, HttpMethod.GET, new HttpEntity<>(buildHeaders()), Map.class);
        Map<?, ?> body = response.getBody();
        if (body == null) {
            throw new ValidationException("Impossible de calculer l'itineraire");
        }

        Object routesObj = body.get("routes");
        if (!(routesObj instanceof List<?> routes) || routes.isEmpty() || !(routes.get(0) instanceof Map<?, ?> firstRoute)) {
            throw new ValidationException("Aucun itineraire disponible pour ce trajet");
        }

        double distanceKm = parseDouble(firstRoute.get("distance")) / 1000.0;
        double durationMinutes = parseDouble(firstRoute.get("duration")) / 60.0;
        List<List<Double>> geometry = extractGeometry(firstRoute.get("geometry"));

        return new MapRouteResponse(fromPoint, toPoint, distanceKm, durationMinutes, geometry);
    }

    private List<List<Double>> extractGeometry(Object geometryObj) {
        if (!(geometryObj instanceof Map<?, ?> geometryMap)) {
            return List.of();
        }
        Object coordsObj = geometryMap.get("coordinates");
        if (!(coordsObj instanceof List<?> coords)) {
            return List.of();
        }
        List<List<Double>> points = new ArrayList<>();
        for (Object p : coords) {
            if (!(p instanceof List<?> point) || point.size() < 2) {
                continue;
            }
            double lng = parseDouble(point.get(0));
            double lat = parseDouble(point.get(1));
            points.add(List.of(lat, lng));
        }
        return points;
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Tawsila/1.0 (academic-project)");
        return headers;
    }

    private double parseDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        return Double.parseDouble(String.valueOf(value));
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
