"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Trophy, Clock, Star, Leaf } from "lucide-react"

interface PlayerStats {
	name: string
	bestTime: string
	bestPoints: number
}


interface LeaderboardEntry {
	name: string;
	bestPoints: number;
	bestTime: string;
}

export function GameDashboard() {
	const [playerStats, setPlayerStats] = useState<PlayerStats>({
		name: "Guardian Player",
		bestTime: "2:35",
		bestPoints: 0,
	})

	const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
		{ name: "Rocket Raccoon", bestPoints: 30000, bestTime: "1:50" },
		{ name: "Star-Lord", bestPoints: 27000, bestTime: "2:05" },
		{ name: "Gamora", bestPoints: 25000, bestTime: "2:10" },
		{ name: "Drax", bestPoints: 22000, bestTime: "2:20" },
		// Placeholder for Guardian Player, will be updated with API fetch
		{ name: "Guardian Player", bestPoints: playerStats.bestPoints, bestTime: playerStats.bestTime },
	])

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AMTguY29tIiwiZXhwIjoxNzU2Njg3MDA4LCJ1c2VyX2lkIjoiZDBlNDM0MzgtY2FkNS00N2NhLTg1ZGEtNzQ5ODRjMzA2ZTVlIn0.28FGamwLo8HNvxS9YnsO5qofenBHHvrKE_9hPYLzDM0" // or wherever you store your JWT
				const res = await fetch("http://localhost:8080/api/gamestats", {
					headers: {
						"Authorization": `Bearer ${token}`,
					},
				})

				const data = await res.json()

				if (data.success && data.data) {
					const realPlayer: PlayerStats = {
						name: "Guardian Player",
						bestTime: data.data.BestTime,
						bestPoints: Number(data.data.BestPoints),
					}
					setPlayerStats(realPlayer)

					// Add/update Guardian Player in leaderboard
					setLeaderboard(prev => {
						// Remove any existing Guardian Player entry
						const filtered = prev.filter(e => e.name !== "Guardian Player")
						return [...filtered, realPlayer] // append with real stats
					})
				}
			} catch (err) {
				console.error("Failed to fetch game stats", err)
			}
		}

		fetchStats()
	}, [])

	const sortedLeaderboard = [...leaderboard].sort(
		(a, b) => b.bestPoints - a.bestPoints
	)

	const handlePlayGame = () => {
		console.log("Play game button clicked")
		console.log("Balls")
		window.location.href = "http://localhost:5173";
	}

	return (
		<div className="bg-gradient-to-b from-[#1a1a2e] to-[#0A0A1A] border-t border-border/40 relative overflow-hidden">
			{/* Cosmic background elements */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-10 left-10 w-2 h-2 bg-accent/30 rounded-full animate-pulse" />
				<div className="absolute top-32 right-20 w-1 h-1 bg-primary/40 rounded-full animate-pulse delay-1000" />
				<div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-accent/20 rounded-full animate-pulse delay-2000" />
				<div className="absolute top-1/3 right-1/3 w-1 h-1 bg-primary/30 rounded-full animate-pulse delay-500" />
			</div>

			<div className="max-w-4xl mx-auto space-y-8">
				{/* Header */}
				<div className="text-center space-y-4 pt-8">
					<div className="flex items-center justify-center gap-2 mb-4">
						<Leaf className="w-8 h-8 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
						<h1 className="text-4xl font-bold text-foreground">Groot's Adventure</h1>
						<Leaf className="w-8 h-8 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] scale-x-[-1]" />
					</div>
					<p className="text-muted-foreground text-lg">{"I am Groot! Ready for another cosmic journey?"}</p>
				</div>

				{/* Groot Image Section */}
				<div className="flex justify-center">
					<div className="relative">
						<div className="w-64 h-64 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 p-4 shadow-2xl">
							<img
								src="https://media.craiyon.com/2025-04-04/7aMo1xcaR7S1kXi6bEYXzw.webp"
								alt="Cute Groot character"
								className="w-full h-full object-cover rounded-full"
							/>
						</div>
						{/* Glowing effect */}
						<div className="absolute inset-0 rounded-full bg-accent/10 animate-pulse" />
					</div>
				</div>

				{/* Player Stats */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-shadow">
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-card-foreground">
								<Clock className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
								Best Time
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold text-foreground">{playerStats.bestTime}</p>
							<p className="text-sm text-muted-foreground mt-1">Personal Record</p>
						</CardContent>
					</Card>

					<Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-shadow">
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-card-foreground">
								<Trophy className="w-5 h-5 text-pink-500 drop-shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
								Best Points
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold text-foreground">{playerStats.bestPoints.toLocaleString()}</p>
							<p className="text-sm text-muted-foreground mt-1">High Score</p>
						</CardContent>
					</Card>
				</div>

				{/* Leaderboard */}
				<div className="mt-10">
					<h2 className="text-2xl font-bold text-foreground mb-4">Leaderboard</h2>
					<div className="space-y-2">
						{[...leaderboard]
							.sort((a, b) => {
								if (b.bestPoints !== a.bestPoints) return b.bestPoints - a.bestPoints
								// If points tie, faster time wins
								const [bMin, bSec] = b.bestTime.split(":").map(Number)
								const [aMin, aSec] = a.bestTime.split(":").map(Number)
								return aMin * 60 + aSec - (bMin * 60 + bSec)
							})
							.map((entry, index) => (
								<div
									key={index}
									className={`flex justify-between items-center bg-card/80 backdrop-blur-sm border border-border/50 p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow ${entry.name === "Guardian Player" ? "border-green-400" : ""
										}`}
								>
									<div className="flex flex-col">
										<span className="font-semibold text-foreground">
											{index + 1}. {entry.name}
										</span>
										<span className="text-sm text-muted-foreground">
											Best Time: {entry.bestTime}
										</span>
									</div>
									<span className="text-pink-500 font-bold">
										{entry.bestPoints.toLocaleString()}
									</span>
								</div>
							))}
					</div>
				</div>
				{/* Play Button */}
				<div className="flex justify-center pt-8">
					<Button
						onClick={handlePlayGame}
						size="lg"
						className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-xl font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group"
					>
						<Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
						Play Game
					</Button>
				</div>

				{/* Footer message */}
				<div className="text-center pt-8 pb-4">
					<p className="text-muted-foreground italic">{'"We are Groot!" - Ready to save the galaxy?'}</p>
				</div>
			</div>
		</div>
	)
}
