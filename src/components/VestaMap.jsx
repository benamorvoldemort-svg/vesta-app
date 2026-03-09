import { useEffect, useRef, useState } from 'react'

const GRIFFINTOWN_CENTER = { lat: 45.4909, lng: -73.5698 }

const MAP_STYLE = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f5efe8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9b99a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e8ddd2' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#faf6f1' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#ede6dc' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d4c9b8' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#e8ddd2' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#cec0b0' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8c7b6b' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#b5a699' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#8c7b6b' }] },
]

export default function VestaMap({ jobs, onJobSelect, selectedJob, workerLocation }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const workerMarkerRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!mapRef.current) return

    function initMap() {
      const map = new window.google.maps.Map(mapRef.current, {
        center: GRIFFINTOWN_CENTER,
        zoom: 15,
        styles: MAP_STYLE,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })
      mapInstanceRef.current = map
      setMapReady(true)
    }

    if (window.google && window.google.maps) {
      initMap()
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(interval)
          initMap()
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [])

  // Worker location marker
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return

    if (workerMarkerRef.current) workerMarkerRef.current.setMap(null)

    const location = workerLocation || GRIFFINTOWN_CENTER

    workerMarkerRef.current = new window.google.maps.Marker({
      position: location,
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

    const infoWindow = new window.google.maps.InfoWindow({
      content: '<div style="font-family:DM Sans,sans-serif;font-size:12px;color:#3D2C1E;padding:4px 8px;font-weight:600;">📍 Vous</div>',
    })

    workerMarkerRef.current.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, workerMarkerRef.current)
    })
  }, [mapReady, workerLocation])

  // Job markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return

    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    jobs.forEach((job) => {
      const position = job.coordinates || getRandomGriffintownPosition()

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: job.address,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: selectedJob?.id === job.id ? '#9A7A48' : '#B8935A',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.8,
          anchor: new window.google.maps.Point(12, 22),
        },
        animation: window.google.maps.Animation.DROP,
      })

      const infoContent = `
        <div style="font-family:'DM Sans',sans-serif;padding:8px;min-width:180px;">
          <p style="font-weight:700;font-size:13px;color:#3D2C1E;margin:0 0 4px">${job.address}</p>
          <p style="font-size:11px;color:#8C7B6B;margin:0 0 8px">${job.size} · ${job.date} à ${job.time}</p>
          <p style="font-size:20px;font-weight:600;color:#B8935A;margin:0 0 8px;font-family:'Cormorant Garamond',serif">${job.price}$</p>
          <button onclick="window.vestaTakeJob('${job.id}')" style="width:100%;padding:8px;background:#B8935A;color:white;border:none;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;">
            ✅ Accepter
          </button>
        </div>
      `

      const infoWindow = new window.google.maps.InfoWindow({ content: infoContent })

      marker.addListener('click', () => {
        markersRef.current.forEach(m => m.infoWindow?.close())
        infoWindow.open(mapInstanceRef.current, marker)
        onJobSelect(job)
      })

      marker.infoWindow = infoWindow
      markersRef.current.push(marker)
    })
  }, [mapReady, jobs, selectedJob])

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  )
}

function getRandomGriffintownPosition() {
  const positions = [
    { lat: 45.4925, lng: -73.5720 },
    { lat: 45.4898, lng: -73.5680 },
    { lat: 45.4915, lng: -73.5650 },
    { lat: 45.4905, lng: -73.5710 },
    { lat: 45.4932, lng: -73.5695 },
  ]
  return positions[Math.floor(Math.random() * positions.length)]
}
