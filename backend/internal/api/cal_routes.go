package api

import "github.com/ieeemumsb/Sinepsis/backend/internal/middleware"

func (s *Server) registerCalendarRoutes() {
	// Events
	s.router.HandleFunc(
		"POST /api/calendar/events",
		middleware.JwtAuthMiddleware(s.handleCreateEvent),
	)
	s.router.HandleFunc(
		"GET /api/calendar/events",
		middleware.JwtAuthMiddleware(s.handleGetEvents),
	)
	s.router.HandleFunc(
		"GET /api/calendar/events-all",
		s.handleGetAllEvents,
	)
	s.router.HandleFunc(
		"PUT /api/calendar/events/{eventID}",
		middleware.JwtAuthMiddleware(s.handleUpdateEvent),
	)
	s.router.HandleFunc(
		"DELETE /api/calendar/events/{eventID}",
		middleware.JwtAuthMiddleware(s.handleDeleteEvent),
	)

	// Missions
	s.router.HandleFunc(
		"POST /api/calendar/missions",
		middleware.JwtAuthMiddleware(s.handleCreateMission),
	)
	s.router.HandleFunc(
		"GET /api/calendar/missions",
		middleware.JwtAuthMiddleware(s.handleGetMissions),
	)
	s.router.HandleFunc(
		"GET /api/calendar/missions/{missionID}",
		middleware.JwtAuthMiddleware(s.handleGetMissionByID),
	)
	s.router.HandleFunc(
		"PUT /api/calendar/missions/{missionID}",
		middleware.JwtAuthMiddleware(s.handleUpdateMission),
	)
	s.router.HandleFunc(
		"DELETE /api/calendar/missions/{missionID}",
		middleware.JwtAuthMiddleware(s.handleDeleteMission),
	)

	// Mission Logs
	s.router.HandleFunc(
		"POST /api/calendar/missions/{missionID}/logs",
		middleware.JwtAuthMiddleware(s.handleAddMissionLog),
	)
	s.router.HandleFunc(
		"GET /api/calendar/missions/{missionID}/logs",
		middleware.JwtAuthMiddleware(s.handleGetMissionLogs),
	)
	s.router.HandleFunc(
		"DELETE /api/calendar/missions/{missionID}/logs/{logID}",
		middleware.JwtAuthMiddleware(s.handleDeleteMissionLog),
	)

	// Mission Attachments
	s.router.HandleFunc(
		"POST /api/calendar/missions/{missionID}/attachments",
		middleware.JwtAuthMiddleware(s.handleAddMissionAttachment),
	)
	s.router.HandleFunc(
		"GET /api/calendar/missions/{missionID}/attachments",
		middleware.JwtAuthMiddleware(s.handleGetMissionAttachments),
	)
	s.router.HandleFunc(
		"DELETE /api/calendar/missions/{missionID}/attachments/{attachmentID}",
		middleware.JwtAuthMiddleware(s.handleDeleteMissionAttachment),
	)

	// Notifications
	s.router.HandleFunc(
		"GET /api/notifications",
		middleware.JwtAuthMiddleware(s.handleGetNotifications),
	)
	s.router.HandleFunc(
		"POST /api/notifications/{notificationID}/read",
		middleware.JwtAuthMiddleware(s.handleMarkNotificationRead),
	)
	s.router.HandleFunc(
		"DELETE /api/notifications/{notificationID}",
		middleware.JwtAuthMiddleware(s.handleDeleteNotification),
	)
}
