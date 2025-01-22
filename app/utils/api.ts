// utils/api.ts (for client-side API calls)

import { Location } from '@/app/types/Location';

// Function to fetch locations from the server
export async function fetchLocations(): Promise<Location[]> {
    try {
        const response = await fetch('/api/locations');
        if (!response.ok) throw new Error('Failed to fetch locations');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching locations:', error);
        throw error;
    }
}

// Function to add a new location
export async function addLocation(location: Omit<Location, 'id'>): Promise<Location> {
    try {
        const response = await fetch('/api/locations/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(location),
        });
        if (!response.ok) throw new Error('Failed to add location');
        const newLocation = await response.json();
        return newLocation;
    } catch (error) {
        console.error('Error adding location:', error);
        throw error;
    }
}

// Function to update an existing location
export async function updateLocation(location: Location): Promise<Location> {
    try {
        const response = await fetch('/api/locations/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(location),
        });
        if (!response.ok) throw new Error('Failed to update location');
        const updatedLocation = await response.json();
        return updatedLocation;
    } catch (error) {
        console.error('Error updating location:', error);
        throw error;
    }
}

// Function to delete a location by ID
export async function deleteLocation(id: number): Promise<void> {
    try {
        const response = await fetch('/api/locations/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error('Failed to delete location');
    } catch (error) {
        console.error('Error deleting location:', error);
        throw error;
    }
}
