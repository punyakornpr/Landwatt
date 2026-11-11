import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, ExternalLink, Search, Layers, Compass, 
  Zap, Eye, PenTool, Trash2, Undo2, 
  Maximize2, Sparkles, Check, RefreshCw, LocateFixed 
} from 'lucide-react';
import { PROVINCES_DATA, findClosestProvince, calculateDistanceKm } from '../data/provinces';
import { TH_ADMIN, findActualProvince, searchAdmin } from '../data/districts';
import { useT } from '../i18n';
import {
  calculatePolygonAreaSqM,
  calculatePolygonPerimeterMeters,
  convertSqMetersToThai
} from '../utils/engineeringCalculations';

export default function GoogleMapPicker({ 
  coordinates = { lat: 14.9799, lng: 102.0977 }, 
  onCoordinatesChange, 
  onProvinceAutoSelect,
  gridDistanceMeters = 100,
  onGridDistanceChange,
  currentAreaSqM = 8000,
  onApplyDrawnArea
}) {
  const t = useT();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const landMarkerRef = useRef(null);
  const gridMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const cornerMarkersRef = useRef([]);
  const currentTileLayerRef = useRef(null);

  const [mapType, setMapType] = useState('esri-satellite');
  const [currentCoords, setCurrentCoords] = useState(coordinates);
  const [gridCoords, setGridCoords] = useState(null);
  const [isPinningGrid, setIsPinningGrid] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedLocationName, setDetectedLocationName] = useState('Nakhon Ratchasima');
  const [searchResults, setSearchResults] = useState([]);
  const [searchState, setSearchState] = useState(null); // null | 'loading' | 'error'
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [pickProvince, setPickProvince] = useState('');
  const [pickDistrict, setPickDistrict] = useState('');
  const [measuredDistanceM, setMeasuredDistanceM] = useState(gridDistanceMeters);
  const [locating, setLocating] = useState(false);

  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [polygonArea, setPolygonArea] = useState({ sqM: 0, rai: 0, ngan: 0, sqWah: 0, totalRaiDecimal: '0' });
  const [polygonPerimeterM, setPolygonPerimeterM] = useState(0);
  const [areaAppliedAlert, setAreaAppliedAlert] = useState(false);

  const tileLayers = {
    'esri-satellite': {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      name: 'Satellite',
      maxZoom: 19,
      subdomains: [],
      attribution: 'Tiles &copy; Esri'
    },
    'google-hybrid': {
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      name: 'Google Satellite',
      maxZoom: 20,
      subdomains: [],
      attribution: 'Map &copy; Google'
    },
    'google-roadmap': {
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      name: 'Roadmap',
      maxZoom: 20,
      subdomains: [],
      attribution: 'Map &copy; Google'
    },
    'osm': {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      name: 'OSM',
      maxZoom: 19,
      subdomains: [],
      attribution: '&copy; OpenStreetMap'
    }
  };

  const isPinningGridRef = useRef(isPinningGrid);
  useEffect(() => {
    isPinningGridRef.current = isPinningGrid;
  }, [isPinningGrid]);

  const isDrawingBoundaryRef = useRef(isDrawingBoundary);
  useEffect(() => {
    isDrawingBoundaryRef.current = isDrawingBoundary;
  }, [isDrawingBoundary]);

  const polygonPointsRef = useRef(polygonPoints);
  useEffect(() => {
    polygonPointsRef.current = polygonPoints;
  }, [polygonPoints]);

  const invalidateMapSize = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  };

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      return;
    }

    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    const map = L.map(container, {
      center: [coordinates.lat, coordinates.lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const layerConfig = tileLayers[mapType] || tileLayers['esri-satellite'];
    const layer = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      subdomains: layerConfig.subdomains || []
    }).addTo(map);
    currentTileLayerRef.current = layer;

    // Clean minimal pin marker
    const landIcon = L.divIcon({
      className: 'custom-land-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="width: 32px; height: 32px; background: #1d1d1f; border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <span style="transform: rotate(45deg); font-size: 13px; font-weight: bold; color: white;">⚡</span>
          </div>
          <div style="background: #ffffff; color: #1d1d1f; border: 1px solid #e8e8ed; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-top: 3px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            Land plot
          </div>
        </div>
      `,
      iconSize: [36, 52],
      iconAnchor: [18, 44]
    });

    const marker = L.marker([coordinates.lat, coordinates.lng], {
      icon: landIcon,
      draggable: true
    }).addTo(map);

    marker.bindPopup(`
      <div style="color: #1d1d1f; font-family: Prompt, sans-serif; font-size: 12px;">
        <strong>Land plot position</strong><br/>
        Coords: ${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}
      </div>
    `);

    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      handleLocationSelect(lat, lng);
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;

      if (isDrawingBoundaryRef.current) {
        addBoundaryPoint(lat, lng);
      } else if (isPinningGridRef.current) {
        setGridLocation(lat, lng);
      } else {
        marker.setLatLng([lat, lng]);
        handleLocationSelect(lat, lng);
      }
    });

    landMarkerRef.current = marker;
    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (currentTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    }
    const layerConfig = tileLayers[mapType] || tileLayers['esri-satellite'];
    const newLayer = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      subdomains: layerConfig.subdomains || []
    }).addTo(mapInstanceRef.current);
    currentTileLayerRef.current = newLayer;

    invalidateMapSize();
  }, [mapType]);

  useEffect(() => {
    if (mapInstanceRef.current && landMarkerRef.current) {
      const cur = landMarkerRef.current.getLatLng();
      if (Math.abs(cur.lat - coordinates.lat) > 0.0001 || Math.abs(cur.lng - coordinates.lng) > 0.0001) {
        landMarkerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
        mapInstanceRef.current.flyTo([coordinates.lat, coordinates.lng], 16, { duration: 1.0 });
        setCurrentCoords(coordinates);

        const actual = findActualProvince(coordinates.lat, coordinates.lng);
        setDetectedLocationName(actual ? (actual.provinceEn || actual.province) : (findClosestProvince(coordinates.lat, coordinates.lng).province.nameEn || findClosestProvince(coordinates.lat, coordinates.lng).province.name));
      }
    }
  }, [coordinates]);

  useEffect(() => {
    invalidateMapSize();
  }, [isDrawingBoundary, isPinningGrid]);

  const handleLocationSelect = (lat, lng) => {
    setCurrentCoords({ lat, lng });
    if (onCoordinatesChange) {
      onCoordinatesChange({ lat, lng });
    }

    // Actual province via nearest district (more accurate than province centroid)
    const actual = findActualProvince(lat, lng);
    const actualName = actual ? actual.province : null;
    // GHI data: use the actual province if it is in the table (Thai name match); else nearest
    const ghiMatch = actualName
      ? PROVINCES_DATA.find(p => p.name.split(' ')[0].split('/')[0] === actualName)
      : null;
    const { province } = findClosestProvince(lat, lng);
    const dataProv = ghiMatch || province;
    const displayName = actual?.provinceEn || dataProv.nameEn || actualName || dataProv.name;
    setDetectedLocationName(displayName);
    if (onProvinceAutoSelect) {
      onProvinceAutoSelect(dataProv, displayName);
    }

    if (gridCoords && mapInstanceRef.current) {
      updateGridDistance([lat, lng], [gridCoords.lat, gridCoords.lng]);
    }
  };

  const addBoundaryPoint = (lat, lng) => {
    const updated = [...polygonPointsRef.current, { lat, lng }];
    setPolygonPoints(updated);
    renderBoundaryPolygon(updated);
  };

  const renderBoundaryPolygon = (points) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    cornerMarkersRef.current.forEach(m => map.removeLayer(m));
    cornerMarkersRef.current = [];

    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (points.length === 0) {
      setPolygonArea({ sqM: 0, rai: 0, ngan: 0, sqWah: 0, totalRaiDecimal: '0' });
      setPolygonPerimeterM(0);
      return;
    }

    const handleIcon = L.divIcon({
      className: 'boundary-corner-handle',
      html: `
        <div style="width: 14px; height: 14px; background: #1d1d1f; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.4); cursor: grab;"></div>
      `,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const newMarkers = points.map((pt, idx) => {
      const m = L.marker([pt.lat, pt.lng], {
        icon: handleIcon,
        draggable: true
      }).addTo(map);

      m.on('drag', (e) => {
        const newPos = e.target.getLatLng();
        const curPoints = [...polygonPointsRef.current];
        curPoints[idx] = { lat: newPos.lat, lng: newPos.lng };
        setPolygonPoints(curPoints);
        if (polygonLayerRef.current) {
          polygonLayerRef.current.setLatLngs(curPoints.map(p => [p.lat, p.lng]));
        }
        recalculateAreaAndPerimeter(curPoints);
      });

      return m;
    });
    cornerMarkersRef.current = newMarkers;

    if (points.length >= 3) {
      const poly = L.polygon(points.map(p => [p.lat, p.lng]), {
        color: '#1d1d1f',
        weight: 2.5,
        dashArray: '5, 5',
        fillColor: '#3b82f6',
        fillOpacity: 0.25
      }).addTo(map);

      polygonLayerRef.current = poly;
      recalculateAreaAndPerimeter(points);
    } else if (points.length === 2) {
      const line = L.polyline(points.map(p => [p.lat, p.lng]), {
        color: '#1d1d1f',
        weight: 2.5,
        dashArray: '5, 5'
      }).addTo(map);
      polygonLayerRef.current = line;
    }
  };

  const recalculateAreaAndPerimeter = (points) => {
    if (points.length < 3) return;
    const sqM = calculatePolygonAreaSqM(points);
    const perim = calculatePolygonPerimeterMeters(points);
    const thai = convertSqMetersToThai(sqM);

    setPolygonArea({
      sqM: Math.round(sqM),
      rai: thai.rai,
      ngan: thai.ngan,
      sqWah: thai.sqWah,
      totalRaiDecimal: (sqM / 1600).toFixed(2)
    });
    setPolygonPerimeterM(Math.round(perim));
  };

  const handleUndoPoint = () => {
    if (polygonPoints.length === 0) return;
    const updated = polygonPoints.slice(0, -1);
    setPolygonPoints(updated);
    renderBoundaryPolygon(updated);
  };

  const handleClearPolygon = () => {
    setPolygonPoints([]);
    renderBoundaryPolygon([]);
    setIsDrawingBoundary(false);
  };

  const handleAutoGenerateBoundaryBox = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const center = currentCoords;
    const targetSqM = currentAreaSqM || 8000;
    
    const widthMeters = Math.sqrt(targetSqM / 1.4);
    const lengthMeters = widthMeters * 1.4;

    const R = 6378137;
    const dLat = (lengthMeters / 2 / R) * (180 / Math.PI);
    const dLng = (widthMeters / 2 / (R * Math.cos(center.lat * Math.PI / 180))) * (180 / Math.PI);

    const generated = [
      { lat: center.lat + dLat, lng: center.lng - dLng },
      { lat: center.lat + dLat, lng: center.lng + dLng },
      { lat: center.lat - dLat, lng: center.lng + dLng },
      { lat: center.lat - dLat, lng: center.lng - dLng }
    ];

    setPolygonPoints(generated);
    renderBoundaryPolygon(generated);
    setIsDrawingBoundary(false);
  };

  const handleApplyArea = () => {
    if (polygonArea.sqM > 50 && onApplyDrawnArea) {
      onApplyDrawnArea(polygonArea.sqM);
      setAreaAppliedAlert(true);
      setTimeout(() => setAreaAppliedAlert(false), 2500);
    }
  };

  const setGridLocation = (lat, lng) => {
    setGridCoords({ lat, lng });
    setIsPinningGrid(false);

    const map = mapInstanceRef.current;
    if (!map) return;

    const gridIcon = L.divIcon({
      className: 'custom-grid-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="width: 30px; height: 30px; background: #ea580c; border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <span style="transform: rotate(45deg); font-size: 13px; font-weight: bold; color: white;">🗼</span>
          </div>
          <div style="background: #ffffff; color: #ea580c; border: 1px solid #fdba74; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-top: 3px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            22kV Line
          </div>
        </div>
      `,
      iconSize: [34, 48],
      iconAnchor: [17, 40]
    });

    if (gridMarkerRef.current) {
      gridMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const gMarker = L.marker([lat, lng], {
        icon: gridIcon,
        draggable: true
      }).addTo(map);

      gMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setGridCoords({ lat: pos.lat, lng: pos.lng });
        updateGridDistance([currentCoords.lat, currentCoords.lng], [pos.lat, pos.lng]);
      });

      gridMarkerRef.current = gMarker;
    }

    updateGridDistance([currentCoords.lat, currentCoords.lng], [lat, lng]);
  };

  const updateGridDistance = (p1, p2) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const distKm = calculateDistanceKm(p1[0], p1[1], p2[0], p2[1]);
    const distMeters = Math.round(distKm * 1000);
    setMeasuredDistanceM(distMeters);

    if (onGridDistanceChange) {
      onGridDistanceChange(distMeters);
    }

    if (polylineRef.current) {
      polylineRef.current.setLatLngs([p1, p2]);
    } else {
      const line = L.polyline([p1, p2], {
        color: '#ea580c',
        weight: 2.5,
        dashArray: '5, 5',
        opacity: 0.9
      }).addTo(map);
      polylineRef.current = line;
    }
  };

  const flyToLocation = (lat, lng, zoom = 15, label = null) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.0 });
    if (landMarkerRef.current) landMarkerRef.current.setLatLng([lat, lng]);
    handleLocationSelect(lat, lng);
    if (label) setDetectedLocationName(label);
    setSearchResults([]);
    setSearchState(null);
  };

  const locateMe = () => {
    if (!navigator.geolocation) { setSearchState('geo-error'); return; }
    setLocating(true);
    setSearchState(null);
    navigator.geolocation.getCurrentPosition(
      pos => { setLocating(false); flyToLocation(pos.coords.latitude, pos.coords.longitude, 16); },
      () => { setLocating(false); setSearchState('geo-error'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Geocoding via Nominatim (OSM) — free, no API key; only used when local data lacks coverage
  const geocodeNominatim = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=th&accept-language=th&limit=6&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'th' } });
    if (!res.ok) throw new Error('geocode failed');
    return res.json();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchResults([]);
    setSearchState(null);

    // 1) lat,lng coordinates
    const coordMatch = q.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      flyToLocation(parseFloat(coordMatch[1]), parseFloat(coordMatch[3]), 16);
      return;
    }

    // 2) district/khet/province names from the local dataset (all 77 provinces)
    const bare = q.replace(/^(อำเภอ|เขต|จังหวัด|ตำบล|แขวง|amphoe|district|province|tambon|khwaeng)\s*/i, '').trim();
    if (bare.length > 0) {
      const matches = searchAdmin(bare);
      if (matches.length === 1 && matches[0].lat) {
        flyToLocation(matches[0].lat, matches[0].lng, 13, matches[0].label);
        return;
      }
      if (matches.length > 0) {
        // multiple results/no coords → show list (geocode on click if needed)
        setSearchResults(matches.slice(0, 10).map(m => ({ ...m, source: 'local' })));
        return;
      }
    }

    // 3) province from the GHI table (coords included)
    const foundProv = PROVINCES_DATA.find(p =>
      p.name.toLowerCase().includes(bare.toLowerCase()) ||
      p.id.toLowerCase().includes(bare.toLowerCase())
    );
    if (foundProv && foundProv.lat && foundProv.lng) {
      flyToLocation(foundProv.lat, foundProv.lng, 11);
      return;
    }

    // 4) sub-district/other place names → online geocoding
    setSearchState('loading');
    try {
      const results = await geocodeNominatim(q);
      if (results.length === 0) {
        setSearchState('error');
        return;
      }
      if (results.length === 1) {
        const r = results[0];
        flyToLocation(parseFloat(r.lat), parseFloat(r.lon), 13, r.display_name.split(',')[0]);
      } else {
        setSearchResults(results.map(r => ({
          label: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          source: 'osm'
        })));
        setSearchState(null);
      }
    } catch {
      setSearchState('error');
    }
  };

  const handlePickResult = async (item) => {
    if (item.lat && item.lng) {
      flyToLocation(item.lat, item.lng, item.district ? 13 : 11, item.label);
      return;
    }
    // local result without coords (some Bangkok khets / whole provinces) → geocode on click
    setSearchState('loading');
    try {
      const results = await geocodeNominatim(`${item.label}, Thailand`);
      if (results.length > 0) {
        flyToLocation(parseFloat(results[0].lat), parseFloat(results[0].lon), item.district ? 13 : 11, item.label);
      } else {
        setSearchState('error');
      }
    } catch {
      setSearchState('error');
    }
  };

  const confirmDistrictPick = async () => {
    const prov = TH_ADMIN.find(p => p.provinceEn === pickProvince);
    const dist = prov?.districts.find(d => d.nameEn === pickDistrict);
    if (!prov) return;
    const label = dist ? `${dist.prefixEn} ${dist.nameEn}, ${prov.provinceEn}` : `${prov.provinceEn} Province`;
    if (dist?.lat) {
      flyToLocation(dist.lat, dist.lng, 13, label);
      setShowDistrictPicker(false);
      return;
    }
    // no coords in dataset → geocode the full name
    setSearchState('loading');
    try {
      const query = dist ? `${dist.prefixEn} ${dist.nameEn}, ${prov.provinceEn}, Thailand` : `${prov.provinceEn} Province, Thailand`;
      const results = await geocodeNominatim(query);
      if (results.length > 0) {
        flyToLocation(parseFloat(results[0].lat), parseFloat(results[0].lon), dist ? 13 : 11, label);
        setShowDistrictPicker(false);
      } else {
        setSearchState('error');
      }
    } catch {
      setSearchState('error');
    }
  };

  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}&z=16`, '_blank');
  };

  return (
    <div className="bg-mute-50 rounded-xl border border-mute-200 p-3.5 space-y-3">
      
      {/* Top Search & Layer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Search + District Picker */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="w-full sm:w-72 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const v = e.target.value;
                setSearchQuery(v);
                // live suggestions while typing — skip coordinate-like input
                const b = v.replace(/^(อำเภอ|เขต|จังหวัด|ตำบล|แขวง|amphoe|district|province|tambon|khwaeng)\s*/i, '').trim();
                setSearchResults(
                  b.length > 0 && !/^[\d\s.,-]+$/.test(v)
                    ? searchAdmin(b).slice(0, 10).map(m => ({ ...m, source: 'local' }))
                    : []
                );
              }}
              placeholder={t('Search district, province or coordinates') + '...'}
              className="w-full bg-white border border-mute-200 focus:border-mute-900 rounded-lg pl-8 pr-16 py-1.5 text-xs text-mute-900 placeholder-mute-400 outline-none transition"
            />
            <Search className="w-3.5 h-3.5 text-mute-400 absolute left-2.5 top-2 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1 top-1 px-2.5 py-0.5 rounded bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-medium transition"
            >
              {t('Search')}
            </button>
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-[1100] bg-white border border-mute-200 rounded-lg shadow-lg overflow-hidden">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePickResult(r)}
                    className="w-full text-left px-3 py-2 text-xs text-mute-800 hover:bg-mute-50 border-b border-mute-100 last:border-b-0 line-clamp-1"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </form>
          <button
            type="button"
            onClick={() => setShowDistrictPicker(v => !v)}
            className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition flex items-center space-x-1 ${
              showDistrictPicker ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-mute-700 border-mute-200 hover:border-mute-400'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t('Province')}</span>
          </button>
          <button
            type="button"
            onClick={locateMe}
            disabled={locating}
            title={t('Use my current location (GPS)')}
            className="shrink-0 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition flex items-center space-x-1 bg-white text-mute-700 border-mute-200 hover:border-mute-400 disabled:opacity-60"
          >
            {locating
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <LocateFixed className="w-3.5 h-3.5" />}
            <span>{locating ? t('Locating…') : t('My location')}</span>
          </button>
        </div>

      </div>

      {/* District Picker Panel */}
      {showDistrictPicker && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-white border border-mute-200 text-xs">
          <MapPin className="w-3.5 h-3.5 text-mute-500" />
          <select
            value={pickProvince}
            onChange={(e) => { setPickProvince(e.target.value); setPickDistrict(''); }}
            className="bg-white border border-[#D2D2D7] rounded-lg px-2 py-1.5 text-xs text-ink max-w-[10rem] outline-none transition hover:border-brand-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
          >
            <option value="">{t('Select province')}</option>
            {TH_ADMIN.map(p => <option key={p.provinceEn} value={p.provinceEn}>{p.provinceEn}</option>)}
          </select>
          <select
            value={pickDistrict}
            onChange={(e) => setPickDistrict(e.target.value)}
            disabled={!pickProvince}
            className="bg-white border border-[#D2D2D7] rounded-lg px-2 py-1.5 text-xs text-ink max-w-[12rem] outline-none transition hover:border-brand-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 disabled:opacity-50"
          >
            <option value="">{pickProvince ? t('Whole province / pick a district') : t('Pick a province first')}</option>
            {pickProvince && TH_ADMIN.find(p => p.provinceEn === pickProvince)?.districts.map(d => (
              <option key={d.nameEn} value={d.nameEn}>{d.prefixEn} {d.nameEn}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={confirmDistrictPick}
            disabled={!pickProvince}
            className="px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-medium transition disabled:opacity-40"
          >
            {t('Go')}
          </button>
        </div>
      )}

      {/* Search status */}
      {(searchState === 'loading' || searchState === 'error' || searchState === 'geo-error') && (
        <p className={`text-[11px] px-1 ${searchState === 'loading' ? 'text-mute-500' : 'text-danger-600'}`}>
          {searchState === 'loading'
            ? t('Searching…')
            : searchState === 'geo-error'
              ? t('Could not get your location — check browser permission')
              : t('Not found — try a district or province name')}
        </p>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-white border border-mute-200 text-xs">
        
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const nextState = !isDrawingBoundary;
              setIsDrawingBoundary(nextState);
              if (nextState) setIsPinningGrid(false);
              invalidateMapSize();
            }}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center space-x-1.5 transition ${
              isDrawingBoundary
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-mute-100 hover:bg-mute-200 text-mute-800'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{isDrawingBoundary ? t('Drawing… (click corners)') : t('Draw boundary')}</span>
          </button>

          <button
            type="button"
            onClick={handleAutoGenerateBoundaryBox}
            className="px-2.5 py-1.5 rounded-md bg-mute-100 hover:bg-mute-200 text-mute-700 transition flex items-center space-x-1 text-xs"
            title={t('Auto-generate a rectangle of the current area around the pin')}
          >
            <Sparkles className="w-3.5 h-3.5 text-mute-600" />
            <span>{t('Auto-fit box')}</span>
          </button>

          {polygonPoints.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleUndoPoint}
                className="px-2 py-1.5 rounded-md bg-mute-100 hover:bg-mute-200 text-mute-600 transition flex items-center space-x-1"
                title={t('Undo last corner')}
              >
                <Undo2 className="w-3 h-3" />
                <span>{t('Undo')} ({polygonPoints.length})</span>
              </button>

              <button
                type="button"
                onClick={handleClearPolygon}
                className="px-2 py-1.5 rounded-md bg-mute-100 hover:bg-danger-50 text-danger-600 transition flex items-center space-x-1"
                title={t('Clear boundary')}
              >
                <Trash2 className="w-3 h-3" />
                <span>{t('Clear')}</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={invalidateMapSize}
            className="p-1.5 rounded-md bg-mute-100 hover:bg-mute-200 text-mute-600 transition"
            title={t('Refresh map size')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              const nextState = !isPinningGrid;
              setIsPinningGrid(nextState);
              if (nextState) setIsDrawingBoundary(false);
              invalidateMapSize();
            }}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition ${
              isPinningGrid
                ? 'bg-volt-600 text-white'
                : 'bg-mute-100 hover:bg-mute-200 text-mute-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isPinningGrid ? t('Click to place pylon') : t('Pin power line')}</span>
          </button>
        </div>

      </div>

      {/* Map Viewport Wrapper */}
      <div 
        className={`relative rounded-lg overflow-hidden border border-mute-200 w-full ${
          isDrawingBoundary ? 'map-drawing-crosshair' : ''
        }`}
        style={{ height: '420px', minHeight: '420px', backgroundColor: '#f5f5f7' }}
      >
        <div 
          ref={mapContainerRef} 
          id="leaflet-land-map-viewport"
          className="w-full h-full leaflet-container"
          style={{ height: '420px', minHeight: '420px', width: '100%', position: 'relative' }}
        />

        {/* Floating Instruction Banner when Drawing */}
        {isDrawingBoundary && (
          <div className="absolute top-3 inset-x-8 z-[500] mx-auto max-w-sm bg-white/95 border border-mute-300 text-mute-800 px-3.5 py-1.5 rounded-lg shadow-md backdrop-blur-md text-xs text-center flex items-center justify-center space-x-2">
            <PenTool className="w-3.5 h-3.5 text-mute-700 flex-shrink-0" />
            <span>{t('Click the map to set each plot corner (at least 3 points)')}</span>
          </div>
        )}

        {/* Floating Live Drawn Area Calculation Card */}
        {polygonPoints.length >= 3 && (
          <div className="absolute bottom-3 right-3 z-[500] bg-white border border-mute-200 p-3 rounded-lg shadow-lg text-xs space-y-1.5 max-w-xs">
            <div className="flex items-center justify-between text-mute-500 text-[11px]">
              <span className="font-semibold text-mute-900 flex items-center">
                <Maximize2 className="w-3.5 h-3.5 mr-1 text-mute-600" />
                {t('Drawn area')}
              </span>
              <span className="font-mono">{polygonPoints.length} {t('corners')}</span>
            </div>

            <div className="text-mute-900 font-mono font-bold text-sm">
              {polygonArea.totalRaiDecimal} {t('rai')} <span className="text-xs text-mute-500 font-normal">({polygonArea.sqM.toLocaleString()} m²)</span>
            </div>

            <div className="text-[11px] text-mute-500 flex justify-between">
              <span>{t('Perimeter:')} <strong className="text-mute-800 font-mono">{polygonPerimeterM}</strong> m</span>
            </div>

            <button
              type="button"
              onClick={handleApplyArea}
              className="w-full mt-1 py-1.5 px-2.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t('Apply this area')}</span>
            </button>

            {areaAppliedAlert && (
              <div className="text-[10px] text-energy-600 text-center font-medium">
                {t('Applied to land size ✓')}
              </div>
            )}
          </div>
        )}

        {/* Floating Map Layer Switcher */}
        <div className="absolute bottom-3 left-3 z-[500] flex items-center space-x-1 bg-white/95 backdrop-blur-sm p-0.5 rounded-lg border border-mute-200 text-xs shadow-md">
          {[
            ['esri-satellite', 'Satellite'],
            ['google-hybrid', 'Hybrid'],
            ['google-roadmap', 'Roadmap'],
          ].map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => setMapType(type)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                mapType === type ? 'bg-brand-600 text-white' : 'text-mute-600 hover:text-mute-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Floating Google Maps Direct Buttons */}
        <div className="absolute top-3 left-3 z-[500] flex items-center space-x-1.5">
          <button
            type="button"
            onClick={openInGoogleMaps}
            className="px-2.5 py-1 rounded-md bg-white/95 hover:bg-white text-mute-800 border border-mute-200 text-xs font-medium flex items-center space-x-1 shadow-sm transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-mute-500" />
            <span>Google Maps</span>
          </button>
        </div>

      </div>

      {/* Real-Time Pin Coordinates Bar */}
      <div className="p-2.5 rounded-lg bg-white border border-mute-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-mute-400 block text-[11px]">{t('Pin coordinates (GPS)')}</span>
          <span className="text-mute-900 font-mono font-medium text-xs mt-0.5 block flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-mute-500" />
            {currentCoords.lat.toFixed(5)}° N, {currentCoords.lng.toFixed(5)}° E
          </span>
        </div>

        <div>
          <span className="text-mute-400 block text-[11px]">{t('Location')}</span>
          <span className="text-mute-800 font-medium text-xs mt-0.5 block">
            {detectedLocationName}
          </span>
        </div>

        <div>
          <span className="text-mute-400 block text-[11px]">{t('Tip')}</span>
          <span className="text-mute-500 text-[11px] mt-0.5 block">
            {t('Drag the ⚡ pin or use "Draw boundary" to outline the real plot')}
          </span>
        </div>
      </div>

    </div>
  );
}
