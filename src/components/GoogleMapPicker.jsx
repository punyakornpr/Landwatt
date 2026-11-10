import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, ExternalLink, Search, Layers, Compass, 
  Zap, Eye, PenTool, Trash2, Undo2, 
  Maximize2, Sparkles, Check, RefreshCw 
} from 'lucide-react';
import { PROVINCES_DATA, findClosestProvince, calculateDistanceKm } from '../data/provinces';
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
  const [detectedLocationName, setDetectedLocationName] = useState('นครราชสีมา');
  const [measuredDistanceM, setMeasuredDistanceM] = useState(gridDistanceMeters);

  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [polygonArea, setPolygonArea] = useState({ sqM: 0, rai: 0, ngan: 0, sqWah: 0, totalRaiDecimal: '0' });
  const [polygonPerimeterM, setPolygonPerimeterM] = useState(0);
  const [areaAppliedAlert, setAreaAppliedAlert] = useState(false);

  const tileLayers = {
    'esri-satellite': {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      name: 'ดาวเทียม',
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
      name: 'แผนที่ถนน',
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
          <div style="width: 32px; height: 32px; background: #18181b; border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <span style="transform: rotate(45deg); font-size: 13px; font-weight: bold; color: white;">⚡</span>
          </div>
          <div style="background: #ffffff; color: #18181b; border: 1px solid #e4e4e7; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-top: 3px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            แปลงที่ดิน
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
      <div style="color: #18181b; font-family: Prompt, sans-serif; font-size: 12px;">
        <strong>ตำแหน่งแปลงที่ดิน</strong><br/>
        พิกัด: ${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}
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

        const { province } = findClosestProvince(coordinates.lat, coordinates.lng);
        setDetectedLocationName(province.name);
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

    const { province } = findClosestProvince(lat, lng);
    setDetectedLocationName(province.name);
    if (onProvinceAutoSelect) {
      onProvinceAutoSelect(province);
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
        <div style="width: 14px; height: 14px; background: #18181b; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.4); cursor: grab;"></div>
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
        color: '#18181b',
        weight: 2.5,
        dashArray: '5, 5',
        fillColor: '#3b82f6',
        fillOpacity: 0.25
      }).addTo(map);

      polygonLayerRef.current = poly;
      recalculateAreaAndPerimeter(points);
    } else if (points.length === 2) {
      const line = L.polyline(points.map(p => [p.lat, p.lng]), {
        color: '#18181b',
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
          <div style="width: 30px; height: 30px; background: #d97706; border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <span style="transform: rotate(45deg); font-size: 13px; font-weight: bold; color: white;">🗼</span>
          </div>
          <div style="background: #ffffff; color: #d97706; border: 1px solid #fcd34d; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-top: 3px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            สายส่ง 22kV
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
        color: '#d97706',
        weight: 2.5,
        dashArray: '5, 5',
        opacity: 0.9
      }).addTo(map);
      polylineRef.current = line;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const coordMatch = searchQuery.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 16);
        if (landMarkerRef.current) landMarkerRef.current.setLatLng([lat, lng]);
        handleLocationSelect(lat, lng);
      }
      return;
    }

    const foundProv = PROVINCES_DATA.find(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundProv && foundProv.lat && foundProv.lng) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([foundProv.lat, foundProv.lng], 15, { duration: 1.0 });
        if (landMarkerRef.current) landMarkerRef.current.setLatLng([foundProv.lat, foundProv.lng]);
        handleLocationSelect(foundProv.lat, foundProv.lng);
      }
    }
  };

  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}&z=16`, '_blank');
  };

  return (
    <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-3.5 space-y-3">
      
      {/* Top Search & Layer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Search */}
        <form onSubmit={handleSearch} className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาอำเภอ, จังหวัด หรือพิกัด..."
            className="w-full bg-white border border-zinc-200 focus:border-zinc-900 rounded-lg pl-8 pr-16 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition"
          />
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1 top-1 px-2.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-medium transition"
          >
            ค้นหา
          </button>
        </form>

        {/* Map Layers */}
        <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-zinc-200 text-xs shadow-sm self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setMapType('esri-satellite')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
              mapType === 'esri-satellite' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            ดาวเทียม
          </button>
          <button
            type="button"
            onClick={() => setMapType('google-hybrid')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
              mapType === 'google-hybrid' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Google Hybrid
          </button>
          <button
            type="button"
            onClick={() => setMapType('google-roadmap')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
              mapType === 'google-roadmap' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            แผนที่ถนน
          </button>
        </div>

      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-white border border-zinc-200 text-xs">
        
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
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{isDrawingBoundary ? 'กำลังคลิกวาด (คลิกมุมบนแผนที่)' : 'วาดกรอบแปลงที่ดิน'}</span>
          </button>

          <button
            type="button"
            onClick={handleAutoGenerateBoundaryBox}
            className="px-2.5 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition flex items-center space-x-1 text-xs"
            title="สร้างกรอบสี่เหลี่ยมอัตโนมัติตามขนาดพื้นที่ปัจจุบันรอบจุดปักหมุด"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
            <span>ตีกรอบอัตโนมัติ</span>
          </button>

          {polygonPoints.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleUndoPoint}
                className="px-2 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition flex items-center space-x-1"
                title="ย้อนกลับจุดมุมล่าสุด"
              >
                <Undo2 className="w-3 h-3" />
                <span>ย้อนกลับ ({polygonPoints.length})</span>
              </button>

              <button
                type="button"
                onClick={handleClearPolygon}
                className="px-2 py-1.5 rounded-md bg-zinc-100 hover:bg-rose-50 text-rose-600 transition flex items-center space-x-1"
                title="ลบเส้นกรอบขอบเขต"
              >
                <Trash2 className="w-3 h-3" />
                <span>ลบกรอบ</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={invalidateMapSize}
            className="p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition"
            title="รีเฟรชขนาดแผนที่"
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
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isPinningGrid ? 'คลิกวางเสาสายส่ง' : 'วัดระยะสายส่ง 22kV'}</span>
          </button>
        </div>

      </div>

      {/* Map Viewport Wrapper */}
      <div 
        className={`relative rounded-lg overflow-hidden border border-zinc-200 w-full ${
          isDrawingBoundary ? 'map-drawing-crosshair' : ''
        }`}
        style={{ height: '420px', minHeight: '420px', backgroundColor: '#f4f4f5' }}
      >
        <div 
          ref={mapContainerRef} 
          id="leaflet-land-map-viewport"
          className="w-full h-full leaflet-container"
          style={{ height: '420px', minHeight: '420px', width: '100%', position: 'relative' }}
        />

        {/* Floating Instruction Banner when Drawing */}
        {isDrawingBoundary && (
          <div className="absolute top-3 inset-x-8 z-[500] mx-auto max-w-sm bg-white/95 border border-zinc-300 text-zinc-800 px-3.5 py-1.5 rounded-lg shadow-md backdrop-blur-md text-xs text-center flex items-center justify-center space-x-2">
            <PenTool className="w-3.5 h-3.5 text-zinc-700 flex-shrink-0" />
            <span>คลิกบนแผนที่ทีละมุมเพื่อกำหนดกรอบที่ดิน (อย่างน้อย 3 จุด)</span>
          </div>
        )}

        {/* Floating Live Drawn Area Calculation Card */}
        {polygonPoints.length >= 3 && (
          <div className="absolute bottom-3 right-3 z-[500] bg-white border border-zinc-200 p-3 rounded-lg shadow-lg text-xs space-y-1.5 max-w-xs">
            <div className="flex items-center justify-between text-zinc-500 text-[11px]">
              <span className="font-semibold text-zinc-900 flex items-center">
                <Maximize2 className="w-3.5 h-3.5 mr-1 text-zinc-600" />
                ขนาดกรอบที่วาด
              </span>
              <span className="font-mono">{polygonPoints.length} มุม</span>
            </div>
            
            <div className="text-zinc-900 font-mono font-bold text-sm">
              {polygonArea.totalRaiDecimal} ไร่ <span className="text-xs text-zinc-500 font-normal">({polygonArea.sqM.toLocaleString()} ตร.ม.)</span>
            </div>

            <div className="text-[11px] text-zinc-500 flex justify-between">
              <span>เส้นรอบรูป: <strong className="text-zinc-800 font-mono">{polygonPerimeterM}</strong> ม.</span>
            </div>

            <button
              type="button"
              onClick={handleApplyArea}
              className="w-full mt-1 py-1.5 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>ใช้ขนาดพื้นที่นี้คำนวณ</span>
            </button>

            {areaAppliedAlert && (
              <div className="text-[10px] text-emerald-600 text-center font-medium">
                ✓ อัปเดตขนาดพื้นที่เรียบร้อยแล้ว
              </div>
            )}
          </div>
        )}

        {/* Floating Google Maps Direct Buttons */}
        <div className="absolute top-3 left-3 z-[500] flex items-center space-x-1.5">
          <button
            type="button"
            onClick={openInGoogleMaps}
            className="px-2.5 py-1 rounded-md bg-white/95 hover:bg-white text-zinc-800 border border-zinc-200 text-xs font-medium flex items-center space-x-1 shadow-sm transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            <span>Google Maps</span>
          </button>
        </div>

      </div>

      {/* Real-Time Pin Coordinates Bar */}
      <div className="p-2.5 rounded-lg bg-white border border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-zinc-400 block text-[11px]">พิกัดหมุด (GPS Coordinates)</span>
          <span className="text-zinc-900 font-mono font-medium text-xs mt-0.5 block flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-zinc-500" />
            {currentCoords.lat.toFixed(5)}° N, {currentCoords.lng.toFixed(5)}° E
          </span>
        </div>

        <div>
          <span className="text-zinc-400 block text-[11px]">พื้นที่และเขตสายส่ง</span>
          <span className="text-zinc-800 font-medium text-xs mt-0.5 block">
            จ. {detectedLocationName}
          </span>
        </div>

        <div>
          <span className="text-zinc-400 block text-[11px]">คำแนะนำ</span>
          <span className="text-zinc-500 text-[11px] mt-0.5 block">
            ลากหมุด ⚡ หรือคลิก "วาดกรอบแปลงที่ดิน" เพื่อครอบแนวแปลงจริง
          </span>
        </div>
      </div>

    </div>
  );
}
