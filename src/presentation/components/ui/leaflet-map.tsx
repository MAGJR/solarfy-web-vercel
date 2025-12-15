"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import ReactDOMServer from "react-dom/server"

interface LeafletMapProps {
  center?: [number, number]
  zoom?: number
  height?: string
  marker?: [number, number]
  onLocationChange?: (lat: number, lng: number) => void
  readonly?: boolean
  showCurrentLocationButton?: boolean
  personName?: string // Name to display on the marker
}

export default function LeafletMap({
  center = [-15.8267, -47.9218], // Default: Brasília, Brazil
  zoom = 13,
  height = "400px",
  marker,
  onLocationChange,
  readonly = false,
  showCurrentLocationButton = true,
  personName,
}: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [currentMarker, setCurrentMarker] = useState<[number, number] | undefined>(marker)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
    setCurrentMarker(marker)
  }, [marker])

  const handleMarkerChange = (lat: number, lng: number) => {
    setCurrentMarker([lat, lng])
    if (onLocationChange) {
      onLocationChange(lat, lng)
    }
  }

  useEffect(() => {
    if (!isClient || !mapRef.current) return

    const initializeMap = async () => {
      try {
        // Import Leaflet dynamically only on client side
        const [reactLeaflet, leaflet] = await Promise.all([
          import("react-leaflet"),
          import("leaflet")
        ])

        // Fix for default icon issue
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        // Load CSS
        await import("leaflet/dist/leaflet.css")

        // Initialize map directly using vanilla Leaflet
        const L = leaflet.default
        const mapContainer = document.createElement('div')
        mapContainer.style.height = height
        mapContainer.style.width = '100%'

        if (mapRef.current) {
          mapRef.current.innerHTML = ''
          mapRef.current.appendChild(mapContainer)

          const map = L.map(mapContainer, {
            center: currentMarker || center,
            zoom: zoom
          })

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map)

          if (currentMarker) {
            // Debug: Check if personName is received
            console.log('LeafletMap - personName:', personName, 'currentMarker:', currentMarker)

            // Create MapPin icon using the imported Lucide React component
            const mapPinComponent = (
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}>
                <MapPin
                  size={32}
                  color="#2563eb"
                  strokeWidth={2.5}
                  style={{ fill: '#2563eb' }}
                />
              </div>
            )

            const mapPinHtml = ReactDOMServer.renderToString(mapPinComponent)

            const customIcon = L.divIcon({
              html: mapPinHtml,
              className: 'lucide-map-pin-react',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            })

            const markerInstance = L.marker(currentMarker, { icon: customIcon }).addTo(map)

            // Enhanced popup with better person name display
            const popupContent = document.createElement('div')
            popupContent.style.minWidth = '220px'
            popupContent.style.padding = '12px'
            popupContent.style.fontSize = '14px'

            if (personName) {
              const nameSection = document.createElement('div')
              nameSection.style.display = 'flex'
              nameSection.style.alignItems = 'center'
              nameSection.style.marginBottom = '10px'
              nameSection.style.paddingBottom = '8px'
              nameSection.style.borderBottom = '1px solid #e5e7eb'

              const personIcon = document.createElement('div')
              personIcon.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              `
              personIcon.style.marginRight = '8px'

              const nameText = document.createElement('span')
              nameText.textContent = personName
              nameText.style.fontWeight = '600'
              nameText.style.color = '#111827'
              nameText.style.fontSize = '15px'

              nameSection.appendChild(personIcon)
              nameSection.appendChild(nameText)
              popupContent.appendChild(nameSection)
            }

            const locationSection = document.createElement('div')
            locationSection.style.display = 'flex'
            locationSection.style.alignItems = 'center'
            locationSection.style.marginBottom = '6px'

            const locationIcon = document.createElement('div')
            locationIcon.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            `
            locationIcon.style.marginRight = '6px'

            const coordsText = document.createElement('span')
            coordsText.textContent = `${currentMarker[0].toFixed(6)}, ${currentMarker[1].toFixed(6)}`
            coordsText.style.color = '#6b7280'
            coordsText.style.fontSize = '12px'
            coordsText.style.fontFamily = 'monospace'

            locationSection.appendChild(locationIcon)
            locationSection.appendChild(coordsText)
            popupContent.appendChild(locationSection)

            if (!readonly) {
              const helpText = document.createElement('div')
              helpText.innerHTML = '💡 Clique no mapa para ajustar a localização'
              helpText.style.color = '#2563eb'
              helpText.style.fontSize = '11px'
              helpText.style.marginTop = '8px'
              helpText.style.fontStyle = 'italic'
              popupContent.appendChild(helpText)
            }

            markerInstance.bindPopup(popupContent)

            if (!readonly) {
              map.on('click', (e: any) => {
                handleMarkerChange(e.latlng.lat, e.latlng.lng)
                // Update marker position
                markerInstance.setLatLng([e.latlng.lat, e.latlng.lng])
              })
            }
          }

          // Add current location button
          if (showCurrentLocationButton && !readonly) {
            const locationButton = document.createElement('button')
            locationButton.className = 'absolute top-4 right-4 z-[1000] bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors'
            locationButton.title = 'Use minha localização atual'
            locationButton.innerHTML = `
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            `
            locationButton.onclick = () => {
              map.locate({ setView: true, maxZoom: 16 })
            }
            mapRef.current.appendChild(locationButton)
          }
        }

      } catch (err) {
        console.error("Error loading map:", err)
        setError("Failed to load map. Please refresh the page.")
      }
    }

    initializeMap()
  }, [isClient, currentMarker, center, zoom, height, readonly, showCurrentLocationButton, handleMarkerChange])

  if (!isClient) {
    // Server-side rendering placeholder
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <p className="text-red-600">❌ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-300">
      <div ref={mapRef} style={{ height, width: "100%" }}>
        {/* Map will be initialized here */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      </div>
    </div>
  )
}