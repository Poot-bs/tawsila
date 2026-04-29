package com.covoiturage.controller;

import com.covoiturage.dto.MapGeocodeResult;
import com.covoiturage.dto.MapRouteResponse;
import com.covoiturage.service.MapIntegrationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/maps")
public class MapController {
    private final MapIntegrationService mapIntegrationService;

    public MapController(MapIntegrationService mapIntegrationService) {
        this.mapIntegrationService = mapIntegrationService;
    }

    @GetMapping("/geocode")
    public List<MapGeocodeResult> geocode(@RequestParam String query) {
        return mapIntegrationService.geocode(query);
    }

    @GetMapping("/route")
    public MapRouteResponse route(@RequestParam String from, @RequestParam String to) {
        return mapIntegrationService.route(from, to);
    }
}
