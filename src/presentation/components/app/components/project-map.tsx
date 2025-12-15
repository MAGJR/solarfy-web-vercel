"use client"

import { useState, useEffect } from "react"
import LeafletMap from "@/presentation/components/ui/leaflet-map"
import { geocodeAddress } from "@/app/app/projects/geocoding/action"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { Button } from "@/presentation/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card"
import { MapPin, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProjectMapProps {
  address?: string
  latitude?: number
  longitude?: number
  onLocationChange: (lat: number, lng: number) => void
  onAddressChange?: (address: string) => void
  readonly?: boolean
  showAddressInput?: boolean
  personName?: string // Name to display on map marker
}

export default function ProjectMap({
  address,
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
  readonly = false,
  showAddressInput = true,
  personName,
}: ProjectMapProps) {
  const [currentAddress, setCurrentAddress] = useState(address || "")
  const [currentCoordinates, setCurrentCoordinates] = useState<[number, number] | undefined>(
    latitude && longitude ? [latitude, longitude] : undefined
  )
  const [isGeocoding, setIsGeocoding] = useState(false)

  // Update state when props change
  useEffect(() => {
    setCurrentAddress(address || "")
  }, [address])

  useEffect(() => {
    if (latitude && longitude) {
      setCurrentCoordinates([latitude, longitude])
    } else {
      setCurrentCoordinates(undefined)
    }
  }, [latitude, longitude])

  const handleAddressChange = (newAddress: string) => {
    setCurrentAddress(newAddress)
    if (onAddressChange) {
      onAddressChange(newAddress)
    }
  }

  const handleGeocodeAddress = async () => {
    if (!currentAddress.trim()) {
      toast.error("Please enter an address")
      return
    }

    setIsGeocoding(true)
    try {
      const result = await geocodeAddress(currentAddress)

      if (result.success && result.data) {
        const { latitude: lat, longitude: lng, displayName } = result.data

        if (lat && lng) {
          setCurrentCoordinates([lat, lng])
          onLocationChange(lat, lng)

          // Update address with the formatted result
          if (displayName && displayName !== currentAddress) {
            setCurrentAddress(displayName)
            if (onAddressChange) {
              onAddressChange(displayName)
            }
          }

          toast.success("Address found on the map!")
        } else {
          toast.error("Unable to find coordinates for this address")
        }
      } else {
        toast.error(result.error || "Address not found")
      }
    } catch (error) {
      console.error("Error geocoding address:", error)
      toast.error("Error searching for address. Please try again.")
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleLocationChange = (lat: number, lng: number) => {
    setCurrentCoordinates([lat, lng])
    onLocationChange(lat, lng)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleGeocodeAddress()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Project Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddressInput && (
          <div className="space-y-2">
            <Label htmlFor="address">Complete Address</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={currentAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter the complete address or click on the map"
                disabled={readonly}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleGeocodeAddress}
                disabled={readonly || isGeocoding || !currentAddress.trim()}
                size="sm"
              >
                {isGeocoding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Enter an address and click search, or click directly on the map to select the location
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Location Map</Label>
          <LeafletMap
            center={currentCoordinates}
            marker={currentCoordinates}
            onLocationChange={handleLocationChange}
            readonly={readonly}
            height="400px"
            showCurrentLocationButton={!readonly}
            personName={personName}
          />

          {currentCoordinates && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium">Selected coordinates:</p>
              <p className="font-mono text-xs">
                Latitude: {currentCoordinates[0].toFixed(6)}, Longitude: {currentCoordinates[1].toFixed(6)}
              </p>
            </div>
          )}

         
        </div>
      </CardContent>
    </Card>
  )
}