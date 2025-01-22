"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { v4 as uuidv4 } from "uuid";

interface Location {
  id: string;
  nama_lokasi: string;
  alamat: string;
  lat: number;
  lng: number;
}

// Default marker icon
const DefaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: -6.124852316256776,
    lng: 106.74177814322435,
  });
  const [cursorPosition, setCursorPosition] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [editMode, setEditMode] = useState<{ id: string | null; isEditing: boolean }>({
    id: null,
    isEditing: false,
  });

  useEffect(() => {
    async function fetchLocations() {
      const response = await fetch("/api/locations");
      const data = await response.json();
      setLocations(data || []);
    }
    fetchLocations();
  }, []);

  const formik = useFormik({
    initialValues: { 
      nama_lokasi: "", 
      alamat: "", 
      lat: "0", // Ensure lat is always defined as a string
      lng: "0"  // Ensure lng is always defined as a string
    },
    validationSchema: Yup.object({
      nama_lokasi: Yup.string().required("Nama lokasi wajib diisi"),
      alamat: Yup.string().required("Alamat wajib diisi"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const newLocation = {
        id: editMode.isEditing ? editMode.id : uuidv4(),
        ...values,
        lat: parseFloat(values.lat), // Ensure valid numbers
        lng: parseFloat(values.lng), // Ensure valid numbers
      };

      if (isNaN(newLocation.lat) || isNaN(newLocation.lng)) {
        console.error("Invalid coordinates provided");
        return;
      }

      // API logic
      const response = await fetch(`/api/locations/${editMode.isEditing ? "update" : "add"}`, {
        method: editMode.isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLocation),
      });
      const savedLocation = await response.json();

      if (editMode.isEditing) {
        setLocations(locations.map((loc) => (loc.id === savedLocation.id ? savedLocation : loc)));
      } else {
        setLocations([...locations, savedLocation]);
      }

      setMapCenter({ lat: savedLocation.lat, lng: savedLocation.lng });
      resetForm();
      setCursorPosition(null);
      setEditMode({ id: null, isEditing: false });

      window.location.reload()
    },
  });
  

  const handleEdit = (loc: Location) => {
    setEditMode({ id: loc.id, isEditing: true });
    formik.setValues({ nama_lokasi: loc.nama_lokasi, alamat: loc.alamat, lat: loc.lat.toString(), lng: loc.lng.toString() });
    setMapCenter({ lat: loc.lat, lng: loc.lng });
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/locations/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setLocations(locations.filter((loc) => loc.id !== id));
  };

  const handleMapClick = async (e: { latlng: { lat: number; lng: number } }) => {
    const { lat, lng } = e.latlng;
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    const address = data.display_name;
    setCursorPosition({ lat, lng, address });
    formik.setFieldValue("lat", lat);
    formik.setFieldValue("lng", lng);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* Form Section */}
      <div className="lg:w-1/3 bg-white shadow-md rounded-lg p-4">
        <h1 className="text-xl font-semibold mb-4">{editMode.isEditing ? "Edit Lokasi" : "Tambah Lokasi"}</h1>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="nama_lokasi"
              placeholder="Nama Lokasi"
              value={formik.values.nama_lokasi || ""}
              onChange={formik.handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
            {formik.errors.nama_lokasi && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.nama_lokasi}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              name="alamat"
              placeholder="Alamat"
              value={formik.values.alamat || ""}
              onChange={formik.handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
            {formik.errors.alamat && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.alamat}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              name="lat"
              placeholder="Latitude"
              value={formik.values.lat || "0"}
              readOnly
              className="w-full p-2 bg-gray-100 border rounded"
            />
          </div>
          <div>
            <input
              type="text"
              name="lng"
              placeholder="Longitude"
              value={formik.values.lng || "0"}
              readOnly
              className="w-full p-2 bg-gray-100 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {editMode.isEditing ? "Simpan Perubahan" : "Tambah Lokasi"}
          </button>
        </form>
        <h2 className="text-lg font-semibold mt-6 mb-2">Daftar Lokasi</h2>
        <ul className="list-disc pl-6">
        {locations.map((loc) => (
            <li key={loc.id} className="text-sm flex justify-between items-center">
              <span
                className="cursor-pointer hover:text-blue-500"
                onClick={() => setMapCenter({ lat: loc.lat, lng: loc.lng })}
              >
                <strong>{loc.nama_lokasi}</strong> - {loc.alamat}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(loc)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Map Section */}
      <div className="lg:w-2/3">
        <MapContainer
          zoom={12}
          center={mapCenter}
          className="h-[500px] w-full rounded-lg shadow-md"
        >
          <SetMapCenter center={mapCenter} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <MapClickHandler onClick={handleMapClick} />
            {cursorPosition && cursorPosition.lat !== 0 && cursorPosition.lng !== 0 && (
            <Marker position={[cursorPosition.lat, cursorPosition.lng]} icon={DefaultIcon}>
                <Popup>
                
                <p>Address: {cursorPosition.address || "Loading..."}</p>
                

                </Popup>
            </Marker>
            )}
            {locations.map((loc) => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={DefaultIcon}>
              <Popup>
                <strong>{loc.nama_lokasi}</strong>
               
                <p className="text-blue-500">
                Address: {loc.alamat}
                </p>
                <p>
                Coordinates: {loc.lat}, {loc.lng}
                </p>
              </Popup>
            </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}

function SetMapCenter({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({
  onClick,
}: {
  onClick: (e: { latlng: { lat: number; lng: number } }) => void;
}) {
  useMapEvents({
    click: onClick,
  });
  return null;
}