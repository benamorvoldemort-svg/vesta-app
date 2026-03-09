import { useEffect, useRef, useState } from 'react'

const GRIFFINTOWN_CENTER = { lat: 45.4909, lng: -73.5698 }

const GRIFFINTOWN_POSITIONS = [
  { lat: 45.4925, lng: -73.5720 },
  { lat: 45.4898, lng: -73.5680 },
  { lat: 45.4915, lng: -73.5650 },
  { lat: 45.4905, lng: -73.5710 },
  { lat: 45.4932, lng: -73.5695 },
]

const MAP_STYLE = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f5efe8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9b99a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e8ddd2' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#ede6dc' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d4c9b8' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8c7b6b' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#8c7b6b' }] },
]

export default function VestaMap({ jobs, onJobSelect, selectedJob, workerLocation, onAccept }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const workerMarkerRef = useRef(null)
  const infoWindowRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  // Init map
  useEffect(() => {
    if (!mapRef.current) return

    function initMap() {
      const map = new window.google.maps.Map(mapRef.current, {
        center: GRIFFINTOWN_CENTER,
        zoom: 15,
        styles: MAP_STYLE,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })
      mapInstanceRef.current = map
      infoWindowRef.current = new window.google.maps.InfoWindow()
      setMapReady(true)
    }

    if (window.google?.maps) {
      initMap()
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps) { clearInterval(interval); initMap() }
      }, 300)
      return () => clearInterval(interval)
    }
  }, [])

  // Worker marker
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    if (workerMarkerRef.current) workerMarkerRef.current.setMap(null)

    workerMarkerRef.current = new window.google.maps.Marker({
      position: workerLocation || GRIFFINTOWN_CENTER,
      map: mapInstanceRef.current,
      title: 'Vous',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#B8935A',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      zIndex: 999,
    })
  }, [mapReady, workerLocation])

  // Job markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    jobs.forEach((job, i) => {
      const position = GRIFFINTOWN_POSITIONS[i % GRIFFINTOWN_POSITIONS.length]

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: job.address,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
              <path d="M18 0 C8 0 0 8 0 18 C0 31 18 44 18 44 C18 44 36 31 36 18 C36 8 28 0 18 0Z" fill="#B8935A"/>
              <text x="18" y="22" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="DM Sans">$</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(36, 44),
          anchor: new window.google.maps.Point(18, 44),
        },
      })

      marker.addListener('click', () => {
        onJobSelect(job)

        const content = `
          <div style="font-family:'DM Sans',sans-serif;padding:4px;min-width:200px;">
            <p style="font-weight:700;font-size:14px;color:#3D2C1E;margin:0 0 4px 0">${job.address}</p>
            <p style="font-size:12px;color:#8C7B6B;margin:0 0 8px 0">${job.size} · ${job.date} à ${job.time}</p>
            <p style="font-size:22px;font-weight:600;color:#B8935A;margin:0 0 10px 0">${job.price}$</p>
            <button id="accept-btn-${job.id}" style="width:100%;padding:10px;background:#B8935A;color:white;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;">
              ✅ Accepter la mission
            </button>
          </div>
        `
        infoWindowRef.current.setContent(content)
        infoWindowRef.current.open(mapInstanceRef.current, marker)

        // Attach click after render
        setTimeout(() => {
          const btn = document.getElementById(`accept-btn-${job.id}`)
          if (btn) btn.onclick = () => { onAccept(job.id); infoWindowRef.current.close() }
        }, 100)
      })

      markersRef.current.push(marker)
    })
  }, [mapReady, jobs])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}
