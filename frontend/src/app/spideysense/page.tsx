"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { CalendarIcon, MapPinIcon, ShieldIcon, ZapIcon, UsersIcon, ClockIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useMapEvents } from "react-leaflet"

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })

let L: typeof import("leaflet") | null = null
if (typeof window !== "undefined") {
  ;(async () => {
    const leaflet = await import("leaflet")
    await import("leaflet/dist/leaflet.css")
    L = leaflet
  })()
}

interface Mission {
  id: string
  title: string
  description: string
  mission_type: string
  latitude: number
  longitude: number
  start_time: string
  end_time: string
  threat_level: string
  success: boolean
}

interface Event {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
}

export default function AvengersCommandCenter() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>({ lat: -20.1609, lng: 57.5012 })

  const [missionTitle, setMissionTitle] = useState("")
  const [missionDescription, setMissionDescription] = useState("")
  const [missionType, setMissionType] = useState("")
  const [threatLevel, setThreatLevel] = useState("")
  const [missionStartDate, setMissionStartDate] = useState<Date>()
  const [missionEndDate, setMissionEndDate] = useState<Date>()
  const [missionStartTime, setMissionStartTime] = useState("")
  const [missionEndTime, setMissionEndTime] = useState("")

  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventStartDate, setEventStartDate] = useState<Date>()
  const [eventEndDate, setEventEndDate] = useState<Date>()
  const [eventStartTime, setEventStartTime] = useState("")
  const [eventEndTime, setEventEndTime] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

interface ApiMission {
  ID: string
  Title: string
  Description?: { String?: string } | string
  MissionType?: { MissionTypeEnum?: string } | string
  Latitude?: { Float64?: number } | number
  Longitude?: { Float64?: number } | number
  StartTime: string
  EndTime?: { Time?: string } | string
  ThreatLevel?: { ThreatLevelEnum?: string } | string
  Success?: boolean
}

interface TransformedMission {
  id: string
  title: string
  description: string
  mission_type: string
  latitude: number
  longitude: number
  start_time: string
  end_time: string
  threat_level: string
  success: boolean
}

const transformMissionData = (apiMission: ApiMission): TransformedMission => {
  return {
    id: apiMission.ID,
    title: apiMission.Title,
    description: typeof apiMission.Description === "object"
      ? apiMission.Description.String || ''
      : apiMission.Description || '',
    mission_type: typeof apiMission.MissionType === "object"
      ? apiMission.MissionType.MissionTypeEnum || ''
      : apiMission.MissionType || '',
    latitude: typeof apiMission.Latitude === "object"
      ? apiMission.Latitude.Float64 || 0
      : apiMission.Latitude || 0,
    longitude: typeof apiMission.Longitude === "object"
      ? apiMission.Longitude.Float64 || 0
      : apiMission.Longitude || 0,
    start_time: apiMission.StartTime,
    end_time: typeof apiMission.EndTime === "object"
      ? apiMission.EndTime.Time || ''
      : apiMission.EndTime || '',
    threat_level: typeof apiMission.ThreatLevel === "object"
      ? apiMission.ThreatLevel.ThreatLevelEnum || 'low'
      : apiMission.ThreatLevel || 'low',
    success: apiMission.Success || false
  }
}

interface ApiEvent {
  ID: string
  Title: string
  Description?: { String?: string } | string
  StartTime: string
  EndTime?: { Time?: string } | string
}

interface TransformedEvent {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
}

const transformEventData = (apiEvent: ApiEvent): TransformedEvent => {
  return {
    id: apiEvent.ID,
    title: apiEvent.Title,
    description: typeof apiEvent.Description === "object"
      ? apiEvent.Description.String || ''
      : apiEvent.Description || '',
    start_time: apiEvent.StartTime,
    end_time: typeof apiEvent.EndTime === "object"
      ? apiEvent.EndTime.Time || ''
      : apiEvent.EndTime || ''
  }
}

// Update your useEffect to use the transformation:
useEffect(() => {
  const fetchOperations = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Fetch missions
      const missionsRes = await fetch("http://localhost:8080/api/calendar/missions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (missionsRes.ok) {
        const missionsData = await missionsRes.json()
        console.log("Raw missions data:", missionsData) // Keep this for debugging
        
        // Transform the data to match component expectations
        if (missionsData.data && Array.isArray(missionsData.data)) {
          const transformedMissions = missionsData.data.map(transformMissionData)
          console.log("Transformed missions:", transformedMissions) // Debug transformed data
          setMissions(transformedMissions)
        } else {
          setMissions([])
        }
      }

      // Fetch events
      const eventsRes = await fetch("http://localhost:8080/api/calendar/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        
        if (eventsData.data && Array.isArray(eventsData.data)) {
          const transformedEvents = eventsData.data.map(transformEventData)
          setEvents(transformedEvents)
        } else {
          setEvents([])
        }
      }
    } catch (error) {
      toast("Failed to load missions or events", {
        action: { label: "Dismiss", onClick: () => {} },
      })
      console.error(error)
    }
  }

  fetchOperations()
}, [])



  const LocationMarker = () => {
    useMapEvents({
      click(e: import("leaflet").LeafletMouseEvent) {
        setCoords(e.latlng)
      },
    })

    if (!coords || !L) return null

    const icon = L.divIcon({
      html: `<div class="text-[#c8102e] animate-bounce" style="font-size:24px;">📍</div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    })

    return <Marker position={coords} icon={icon as L.DivIcon} />
  }

  const createMission = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")

      const missionData = {
        title: missionTitle,
        description: missionDescription,
        mission_type: missionType,
        latitude: coords?.lat || -20.1609,
        longitude: coords?.lng || 57.5012,
        start_time:
          missionStartDate && missionStartTime
            ? `${format(missionStartDate, "yyyy-MM-dd")}T${missionStartTime}:00Z`
            : new Date().toISOString(),
        end_time:
          missionEndDate && missionEndTime
            ? `${format(missionEndDate, "yyyy-MM-dd")}T${missionEndTime}:00Z`
            : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        threat_level: threatLevel,
        success: false,
      }

      const response = await fetch("http://localhost:8080/api/calendar/missions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(missionData),
      })

      if (response.ok) {
        const body = {
          title: `${missionData.description}`,
          message: `New mission deployed at coordinates (${missionData.latitude.toFixed(
            2,
          )}, ${missionData.longitude.toFixed(2)}) with threat level: ${missionData.threat_level.toUpperCase()}.`,
          threat_level: missionData.threat_level,
        }
        const res = await fetch("https://glowing-cod-676w744pwwj264x-5678.app.github.dev/webhook/ntfy-send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        const newMission = await response.json()
        setMissions((prev) => [...prev, newMission])
        toast("Mission has been created", {
          action: {
            label: "Dismiss",
            onClick: () => console.log("Dismissed"),
          },
        })

        setMissionTitle("")
        setMissionDescription("")
        setMissionType("")
        setThreatLevel("")
        setMissionStartDate(undefined)
        setMissionEndDate(undefined)
        setMissionStartTime("")
        setMissionEndTime("")
        setCoords({ lat: -20.1609, lng: 57.5012 })
      }
    } catch (error) {
      toast("Mission creation failed", {
        action: {
          label: "Dismiss",
          onClick: () => console.log("Dismissed"),
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createEvent = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")

      const eventData = {
        title: eventTitle,
        description: eventDescription,
        start_time:
          eventStartDate && eventStartTime
            ? `${format(eventStartDate, "yyyy-MM-dd")}T${eventStartTime}:00Z`
            : new Date().toISOString(),
        end_time:
          eventEndDate && eventEndTime
            ? `${format(eventEndDate, "yyyy-MM-dd")}T${eventEndTime}:00Z`
            : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      }

      const response = await fetch("http://localhost:8080/api/calendar/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        const newEvent = await response.json()
        setEvents((prev) => [...prev, newEvent])
        toast("Event has been created", {
          action: {
            label: "Dismiss",
            onClick: () => console.log("Dismissed"),
          },
        })
        setEventTitle("")
        setEventDescription("")
        setEventStartDate(undefined)
        setEventEndDate(undefined)
        setEventStartTime("")
        setEventEndTime("")
      }
    } catch (error) {
      toast("Event creation failed", {
        action: {
          label: "Dismiss",
          onClick: () => console.log("Dismissed"),
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-accent"
      case "high":
        return "bg-primary"
      case "critical":
        return "bg-destructive"
      default:
        return "bg-muted"
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-white">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShieldIcon className="h-12 w-12 text-[#c8102e]" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#c8102e] via-[#ffcc00] to-[#0033cc] bg-clip-text text-transparent">
              AVENGERS COMMAND CENTER
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Mission Control • Event Coordination • Hero Operations</p>
        </div>

        <Tabs defaultValue="create-mission" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-[#2a2a2e] border-[#3a3a3e]">
            <TabsTrigger
              value="create-mission"
              className="data-[state=active]:bg-[#c8102e] data-[state=active]:text-white text-gray-300"
            >
              <ZapIcon className="h-4 w-4 mr-2" />
              Create Mission
            </TabsTrigger>
            <TabsTrigger
              value="create-event"
              className="data-[state=active]:bg-[#0033cc] data-[state=active]:text-white text-gray-300"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Create Event
            </TabsTrigger>
            <TabsTrigger
              value="my-operations"
              className="data-[state=active]:bg-[#ffcc00] data-[state=active]:text-[#1c1c1e] text-gray-300"
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              My Operations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create-mission">
            <Card className="border-[#c8102e]/20 bg-[#2a2a2e] text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#c8102e]">
                  <ZapIcon className="h-5 w-5" />
                  Deploy New Mission
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure mission parameters and deploy heroes to the field
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">
                        Mission Title
                      </Label>
                      <Input
                        id="title"
                        value={missionTitle}
                        onChange={(e) => setMissionTitle(e.target.value)}
                        placeholder="Operation: Save the World"
                        required
                        className="bg-[#2a2a2e] border-[#3a3a3e] text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mission_type" className="text-white">
                        Mission Type
                      </Label>
                      <Select value={missionType} onValueChange={setMissionType} required>
                        <SelectTrigger className="bg-[#2a2a2e] border-[#3a3a3e] text-white">
                          <SelectValue placeholder="Select mission type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#3a3a3e] border-[#3a3a3e] text-white">
                          <SelectItem value="recon">Reconnaissance</SelectItem>
                          <SelectItem value="rescue">Rescue Operation</SelectItem>
                          <SelectItem value="combat">Combat Mission</SelectItem>
                          <SelectItem value="defense">Defense Protocol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">
                      Mission Brief
                    </Label>
                    <Textarea
                      id="description"
                      value={missionDescription}
                      onChange={(e) => setMissionDescription(e.target.value)}
                      placeholder="Detailed mission objectives and intel..."
                      className="min-h-[100px] bg-[#2a2a2e] border-[#3a3a3e] text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Mission Location</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={
                          coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : "Select location on map"
                        }
                        value={coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : ""}
                        readOnly
                        className="flex-1 bg-[#2a2a2e] border-[#3a3a3e] text-white placeholder:text-gray-400"
                      />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="bg-[#2a2a2e] border-[#3a3a3e] text-white hover:bg-[#3a3a3e]"
                          >
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            Select on Map
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl w-full p-0 bg-[#2a2a2e] border-[#3a3a3e]">
                          <DialogHeader className="p-6 pb-0">
                            <DialogTitle className="text-white">Select Mission Location</DialogTitle>
                          </DialogHeader>
                          <div className="w-full h-96 p-6 pt-4">
                            <MapContainer
                              center={[-20.1609, 57.5012]}
                              zoom={10}
                              style={{ width: "100%", height: "100%", borderRadius: "8px" }}
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              />
                              <LocationMarker />
                            </MapContainer>
                          </div>
                          <div className="p-6 pt-0 flex justify-between items-center">
                            <p className="text-gray-400 text-sm">
                              {coords
                                ? `Selected: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
                                : "Click on the map to select a location"}
                            </p>
                            <DialogClose asChild>
                              <Button className="bg-[#c8102e] hover:bg-[#c8102e]/90 text-white">
                                Confirm Location
                              </Button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Mission Start</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex-1 justify-start text-left font-normal bg-[#2a2a2e] border-[#3a3a3e] text-white hover:bg-[#3a3a3e]",
                                !missionStartDate && "text-gray-400",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {missionStartDate ? format(missionStartDate, "PPP") : "Pick date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#3a3a3e] border-[#3a3a3e]" align="start">
                            <Calendar
                              mode="single"
                              selected={missionStartDate}
                              onSelect={setMissionStartDate}
                              initialFocus
                              className="text-white"
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="time"
                          value={missionStartTime}
                          onChange={(e) => setMissionStartTime(e.target.value)}
                          className="w-32 bg-[#2a2a2e] border-[#3a3a3e] text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Mission End</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex-1 justify-start text-left font-normal bg-[#2a2a2e] border-[#3a3a3e] text-white hover:bg-[#3a3a3e]",
                                !missionEndDate && "text-gray-400",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {missionEndDate ? format(missionEndDate, "PPP") : "Pick date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#3a3a3e] border-[#3a3a3e]" align="start">
                            <Calendar
                              mode="single"
                              selected={missionEndDate}
                              onSelect={setMissionEndDate}
                              initialFocus
                              className="text-white"
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="time"
                          value={missionEndTime}
                          onChange={(e) => setMissionEndTime(e.target.value)}
                          className="w-32 bg-[#2a2a2e] border-[#3a3a3e] text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="threat_level" className="text-white">
                      Threat Level
                    </Label>
                    <Select value={threatLevel} onValueChange={setThreatLevel} required>
                      <SelectTrigger className="bg-[#2a2a2e] border-[#3a3a3e] text-white">
                        <SelectValue placeholder="Assess threat level" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#3a3a3e] border-[#3a3a3e] text-white">
                        <SelectItem value="low">🟢 Low - Routine Operation</SelectItem>
                        <SelectItem value="medium">🟡 Medium - Enhanced Vigilance</SelectItem>
                        <SelectItem value="high">🔴 High - All Hands Required</SelectItem>
                        <SelectItem value="critical">⚫ Critical - Code Red Alert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={createMission}
                    disabled={isLoading || !coords}
                    className="w-full bg-[#c8102e] hover:bg-[#c8102e]/90 text-white disabled:opacity-50"
                  >
                    {isLoading ? "Deploying..." : "Deploy Mission"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-event">
            <Card className="border-[#0033cc]/20 bg-[#2a2a2e] text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0033cc]">
                  <CalendarIcon className="h-5 w-5" />
                  Schedule New Event
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Coordinate team meetings and strategic planning sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="event-title" className="text-white">
                      Event Title
                    </Label>
                    <Input
                      id="event-title"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="Avengers Assembly Meeting"
                      required
                      className="bg-[#2a2a2e] border-[#3a3a3e] text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-description" className="text-white">
                      Event Description
                    </Label>
                    <Textarea
                      id="event-description"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      placeholder="Strategic planning and mission debriefing..."
                      className="min-h-[100px] bg-[#2a2a2e] border-[#3a3a3e] text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Start Time</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex-1 justify-start text-left font-normal bg-[#2a2a2e] border-[#3a3a3e] text-white hover:bg-[#3a3a3e]",
                                !eventStartDate && "text-gray-400",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {eventStartDate ? format(eventStartDate, "PPP") : "Pick date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#3a3a3e] border-[#3a3a3e]" align="start">
                            <Calendar
                              mode="single"
                              selected={eventStartDate}
                              onSelect={setEventStartDate}
                              initialFocus
                              className="text-white"
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="time"
                          value={eventStartTime}
                          onChange={(e) => setEventStartTime(e.target.value)}
                          className="w-32 bg-[#2a2a2e] border-[#3a3a3e] text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">End Time</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex-1 justify-start text-left font-normal bg-[#2a2a2e] border-[#3a3a3e] text-white hover:bg-[#3a3a3e]",
                                !eventEndDate && "text-gray-400",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {eventEndDate ? format(eventEndDate, "PPP") : "Pick date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#3a3a3e] border-[#3a3a3e]" align="start">
                            <Calendar
                              mode="single"
                              selected={eventEndDate}
                              onSelect={setEventEndDate}
                              initialFocus
                              className="text-white"
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="time"
                          value={eventEndTime}
                          onChange={(e) => setEventEndTime(e.target.value)}
                          className="w-32 bg-[#2a2a2e] border-[#3a3a3e] text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={createEvent}
                    disabled={isLoading}
                    className="w-full bg-[#0033cc] hover:bg-[#0033cc]/90 text-white"
                  >
                    {isLoading ? "Scheduling..." : "Schedule Event"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-operations">
            <div className="space-y-6">
              <Card className="border-[#ffcc00]/20 bg-[#2a2a2e] text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#ffcc00]">
                    <ZapIcon className="h-5 w-5" />
                    Active Missions ({missions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {missions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No missions deployed. Ready for action when you are, hero.
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {missions.map((mission, index) => (
                      <div key={mission.id || index} className="border border-[#3a3a3e] rounded-lg p-4 space-y-3 bg-[#2a2a2e]">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg text-white">{mission.title || 'Untitled Mission'}</h3>
                          <Badge className={`${getThreatLevelColor(mission.threat_level || 'low')} text-white`}>
                            {mission.threat_level || 'unknown'}
                          </Badge>
                        </div>
                        <p className="text-gray-400">{mission.description || 'No description available'}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-4 w-4" />
                            {mission.latitude || 0}, {mission.longitude || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {mission.start_time ? new Date(mission.start_time).toLocaleDateString() : 'No date'}
                          </span>
                          <Badge variant="outline" className="border-[#3a3a3e] text-gray-300">
                            {mission.mission_type || 'unknown'}
                          </Badge>
                          <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="bg-[#2a2a2e] border-[#3a3a3e] text-white hover:bg-[#3a3a3e]"
                          >
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            See on Map
                          </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl w-full p-0 bg-[#2a2a2e] border-[#3a3a3e]">
                            <DialogHeader className="p-6 pb-0">
                              <DialogTitle className="text-white">Select Mission Location</DialogTitle>
                            </DialogHeader>
                            <div className="w-full h-96 p-6 pt-4">
                              <MapContainer
                                center={[mission.longitude, mission.latitude]}
                                zoom={10}
                                style={{ width: "100%", height: "100%", borderRadius: "8px" }}
                              >
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker />
                              </MapContainer>
                            </div>
                            <div className="p-6 pt-0 flex justify-between items-center">
                              <DialogClose asChild>
                                <Button className="bg-[#c8102e] hover:bg-[#c8102e]/90 text-white">
                                  Confirm Location
                                </Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
                        </Dialog>
                        </div>
                        <details className="text-xs text-gray-500">
                          <summary>Debug: Raw mission data</summary>
                          <pre>{JSON.stringify(mission, null, 2)}</pre>
                        </details>
                      </div>
                    ))}
                  </div>
                )}
                </CardContent>
              </Card>

              <Card className="border-[#0033cc]/20 bg-[#2a2a2e] text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#0033cc]">
                    <CalendarIcon className="h-5 w-5" />
                    Scheduled Events ({events.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No events scheduled. Time to plan the next team assembly.
                    </p>
                  ) : (
                    <div className="grid gap-4">
                      {events.map((event) => (
                        <div key={event.id} className="border border-[#3a3a3e] rounded-lg p-4 space-y-3 bg-[#2a2a2e]">
                          <h3 className="font-semibold text-lg text-white">{event.title}</h3>
                          <p className="text-gray-400">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {new Date(event.start_time).toLocaleDateString()} -{" "}
                              {new Date(event.end_time).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
