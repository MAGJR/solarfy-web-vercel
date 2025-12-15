"use server"

import { prisma } from "@/infrastructure/database/prisma"

export interface GeocodeResult {
  latitude?: number
  longitude?: number
  displayName?: string
  address?: string
}

export async function geocodeAddress(address: string): Promise<{ success: boolean; data?: GeocodeResult; error?: string }> {
  try {
    if (!address?.trim()) {
      return { success: false, error: "Address is required" }
    }

    // Check cache first
    const cached = await prisma.geocodingCache.findUnique({
      where: { address }
    })

    if (cached) {
      return {
        success: true,
        data: {
          latitude: cached.latitude,
          longitude: cached.longitude,
          displayName: cached.displayName,
          address: cached.formattedAddress || cached.address
        }
      }
    }

    // OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'SolarfyApp/1.0' // Required by Nominatim usage policy
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Geocoding service error: ${response.status}`)
    }

    const results = await response.json()

    if (results.length === 0) {
      return { success: false, error: "Address not found" }
    }

    const result = results[0]
    const latitude = parseFloat(result.lat)
    const longitude = parseFloat(result.lon)

    // Save to cache for future requests
    try {
      await prisma.geocodingCache.upsert({
        where: { address },
        update: {
          latitude,
          longitude,
          displayName: result.display_name,
          formattedAddress: result.display_name,
          updatedAt: new Date()
        },
        create: {
          address,
          latitude,
          longitude,
          displayName: result.display_name,
          formattedAddress: result.display_name
        }
      })
    } catch (cacheError) {
      // Cache creation/update is not critical, so we continue even if it fails
      console.warn("Failed to cache geocoding result:", cacheError)
    }

    return {
      success: true,
      data: {
        latitude,
        longitude,
        displayName: result.display_name,
        address: result.display_name
      }
    }

  } catch (error: any) {
    console.error("Error geocoding address:", error)
    return {
      success: false,
      error: error.message || "Failed to geocode address"
    }
  }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<{ success: boolean; data?: GeocodeResult; error?: string }> {
  try {
    if (!latitude || !longitude) {
      return { success: false, error: "Latitude and longitude are required" }
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return { success: false, error: "Invalid coordinates" }
    }

    // Check cache first
    const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`
    const cached = await prisma.geocodingCache.findUnique({
      where: { address: cacheKey }
    })

    if (cached) {
      return {
        success: true,
        data: {
          latitude: cached.latitude,
          longitude: cached.longitude,
          displayName: cached.displayName,
          address: cached.formattedAddress || cached.address
        }
      }
    }

    // OpenStreetMap Nominatim reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'SolarfyApp/1.0' // Required by Nominatim usage policy
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Reverse geocoding service error: ${response.status}`)
    }

    const result = await response.json()

    if (result.error) {
      return { success: false, error: "No address found for these coordinates" }
    }

    // Save to cache
    try {
      await prisma.geocodingCache.upsert({
        where: { address: cacheKey },
        update: {
          latitude,
          longitude,
          displayName: result.display_name,
          formattedAddress: result.display_name,
          updatedAt: new Date()
        },
        create: {
          address: cacheKey,
          latitude,
          longitude,
          displayName: result.display_name,
          formattedAddress: result.display_name
        }
      })
    } catch (cacheError) {
      console.warn("Failed to cache reverse geocoding result:", cacheError)
    }

    return {
      success: true,
      data: {
        latitude,
        longitude,
        displayName: result.display_name,
        address: result.display_name
      }
    }

  } catch (error: any) {
    console.error("Error reverse geocoding:", error)
    return {
      success: false,
      error: error.message || "Failed to reverse geocode coordinates"
    }
  }
}