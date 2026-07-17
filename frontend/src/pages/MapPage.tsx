import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { AlertTriangle, Home, Truck } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { incidentsAPI, sheltersAPI, rescueTeamsAPI } from '../lib/api'
import type { Incident, Shelter, RescueTeam } from '../types'
import { renderToStaticMarkup } from 'react-dom/server'

// Custom DivIcons for different marker types
const createIcon = (icon: React.ReactElement, color: string) => {
  const markup = renderToStaticMarkup(
    <div style={{ color, background: '#0B1220', padding: '4px', borderRadius: '50%', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
      {icon}
    </div>
  )
  return new L.DivIcon({
    html: markup,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

const incidentIcon = createIcon(<AlertTriangle size={20} />, '#EF4444')
const shelterIcon = createIcon(<Home size={20} />, '#22C55E')
const teamIcon = createIcon(<Truck size={20} />, '#3B82F6')

const MapPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [teams, setTeams] = useState<RescueTeam[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    showIncidents: true,
    showShelters: true,
    showTeams: true
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incRes, shelRes, teamRes] = await Promise.all([
          incidentsAPI.list(),
          sheltersAPI.list(),
          rescueTeamsAPI.list()
        ])
        setIncidents(incRes.data)
        setShelters(shelRes.data)
        setTeams(teamRes.data)
      } catch (error) {
        console.error("Error fetching map data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Live <span className="gradient-text">Disaster Map</span></h1>
            <p className="text-gray-400">Real-time visualization of incidents, shelters, and rescue teams.</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setFilters(prev => ({ ...prev, showIncidents: !prev.showIncidents }))}
              className={`btn-glass flex items-center gap-2 text-sm ${filters.showIncidents ? 'bg-red-500/20 border-red-500/50' : ''}`}
            >
              <AlertTriangle className="w-4 h-4 text-red-500" /> Incidents
            </button>
            <button 
              onClick={() => setFilters(prev => ({ ...prev, showShelters: !prev.showShelters }))}
              className={`btn-glass flex items-center gap-2 text-sm ${filters.showShelters ? 'bg-green-500/20 border-green-500/50' : ''}`}
            >
              <Home className="w-4 h-4 text-green-500" /> Shelters
            </button>
            <button 
              onClick={() => setFilters(prev => ({ ...prev, showTeams: !prev.showTeams }))}
              className={`btn-glass flex items-center gap-2 text-sm ${filters.showTeams ? 'bg-blue-500/20 border-blue-500/50' : ''}`}
            >
              <Truck className="w-4 h-4 text-blue-500" /> Teams
            </button>
          </div>
        </motion.div>

        <div className="glass-card flex-1 rounded-2xl overflow-hidden relative" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0B1220]/50 z-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00D4FF]"></div>
            </div>
          ) : null}
          
          <MapContainer 
            center={[22.5726, 88.3639]} // Default to India/Kolkata context
            zoom={5} 
            style={{ height: '100%', width: '100%', background: '#0f172a' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {filters.showIncidents && incidents.map((inc) => (
              <Marker key={`inc-${inc.id}`} position={[inc.latitude, inc.longitude]} icon={incidentIcon}>
                <Popup className="custom-popup">
                  <div className="p-2 text-gray-800">
                    <h3 className="font-bold text-lg">{inc.title}</h3>
                    <p className="text-sm capitalize mb-2"><span className="font-semibold">Type:</span> {inc.type}</p>
                    <p className="text-sm capitalize"><span className="font-semibold">Severity:</span> {inc.severity}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {filters.showShelters && shelters.map((shelter) => (
              <Marker key={`sh-${shelter.id}`} position={[shelter.latitude, shelter.longitude]} icon={shelterIcon}>
                <Popup className="custom-popup">
                  <div className="p-2 text-gray-800">
                    <h3 className="font-bold text-lg">{shelter.name}</h3>
                    <p className="text-sm"><span className="font-semibold">Capacity:</span> {shelter.current_occupancy} / {shelter.capacity}</p>
                    <p className="text-sm mt-1">{shelter.contact}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {filters.showTeams && teams.map((team) => (
              <Marker key={`t-${team.id}`} position={[team.latitude, team.longitude]} icon={teamIcon}>
                <Popup className="custom-popup">
                  <div className="p-2 text-gray-800">
                    <h3 className="font-bold text-lg">{team.name}</h3>
                    <p className="text-sm capitalize"><span className="font-semibold">Spec:</span> {team.specialization}</p>
                    <p className="text-sm"><span className="font-semibold">Members:</span> {team.members_count}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>
      
      {/* Custom styles for leaflet popup in dark mode */}
      <style>{`
        .leaflet-popup-content-wrapper { background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 12px; }
        .leaflet-popup-tip { background: rgba(15, 23, 42, 0.95); }
        .leaflet-container a.leaflet-popup-close-button { color: #aaa; }
        .custom-popup .text-gray-800 { color: #f1f5f9; }
      `}</style>
    </div>
  )
}

export default MapPage
