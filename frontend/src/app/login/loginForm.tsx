"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Shield, Sparkles, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { toast } from "sonner"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (response.ok) {
        console.log("Login successful:", data)
        localStorage.setItem("token", data.data.token)
                toast("You have logged in", {
          action: {
            label: "Dismiss",
            onClick: () => console.log("Dismissed"),
          },
        })
        window.location.href = "/"

      } else {
        setError(data.message || "Something went wrong. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:8080/api/auth/google/login"
  }

  return (
    <div className="w-full flex flex-col md:flex-row p-6 md:p-10 justify-center items-center md:items-start max-w-[90%] md:max-w-[70%] min-h-[500px] shadow-2xl gap-8 rounded-2xl bg-gradient-to-br from-[#0A0A1A] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 md:w-96 h-80 md:h-96 bg-primary/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-56 md:w-64 h-56 md:h-64 bg-secondary/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 md:w-80 h-64 md:h-80 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Circuit Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 400 400">
          <defs>
            <pattern id="circuit-login" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 0 50 L 50 50 M 50 0 L 50 100 M 50 50 L 100 50" stroke="currentColor" strokeWidth="1" fill="none" />
              <circle cx="50" cy="50" r="3" fill="currentColor" />
              <circle cx="0" cy="50" r="2" fill="currentColor" />
              <circle cx="100" cy="50" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-login)" />
        </svg>
      </div>

      {/* Left Side Image */}
      <div className="w-full md:w-1/3 flex items-center justify-center relative z-10">
        <div className="relative">
          <img
            src="login.png"
            alt="Login Image"
            className="rounded-2xl object-cover w-full h-auto max-h-[400px] shadow-2xl shadow-primary/20 border border-primary/20"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/10 to-transparent"></div>
        </div>
      </div>

      {/* Enhanced Login Card */}
      <Card className="w-full md:w-1/2 border-2 border-primary/30 bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-xl shadow-2xl shadow-primary/20 rounded-2xl relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 border-2 border-primary/40 shadow-lg shadow-primary/25">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full animate-bounce"></div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent mb-2">
            Access Command Center
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            Enter your credentials to return to the Marvel Universe
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              {/* Enhanced Email Input */}
              <div className="grid gap-3">
                <Label htmlFor="email" className="text-primary font-semibold text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="tony@starkindustries.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 text-lg bg-gradient-to-r from-card/80 to-primary/5 border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 text-white placeholder-gray-400 rounded-xl transition-all duration-300 hover:border-primary/50 focus:bg-card/90"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Password Input */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-primary font-semibold text-lg flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-primary hover:text-secondary transition-colors duration-300 text-sm underline-offset-4 hover:underline"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 text-lg bg-gradient-to-r from-card/80 to-primary/5 border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 text-white placeholder-gray-400 rounded-xl transition-all duration-300 hover:border-primary/50 focus:bg-card/90 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-secondary transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                
                <div className="text-right">
                  <a
                    href="#"
                    className="text-primary hover:text-secondary transition-colors duration-300 text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>
            </div>
          </form>
        </CardContent>

        {/* Enhanced Error Display */}
        {error && (
          <div className="mx-6 p-4 rounded-xl border-2 border-red-500/30 bg-gradient-to-r from-red-500/10 to-pink-500/10 shadow-lg shadow-red-500/25">
            <div className="flex items-center gap-2 text-red-300">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Enhanced Footer */}
        <CardFooter className="flex-col gap-4 pt-6">
          <Button
            type="submit"
            className="w-full h-14 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold text-lg shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Assembling Avengers...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Access Command Center</span>
              </div>
            )}
          </Button>
          
          <Button
            variant="outline"
            className="w-full h-12 border-2 border-primary/30 text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
            onClick={handleGoogleSignIn}
          >
            <div className="w-5 h-5 mr-2">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            Continue with Google
          </Button>
          
          {/* Enhanced Sign Up Link */}
          <div className="w-full text-center pt-2">
            <p className="text-gray-300 mb-3">New to the Marvel Universe?</p>
            <Button
              variant="outline"
              className="w-full border-2 border-secondary/30 text-secondary hover:bg-secondary hover:text-white hover:shadow-lg hover:shadow-secondary/25 transition-all duration-300 hover:scale-105"
              onClick={() => window.location.href = "/signup"}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Join the Initiative
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
