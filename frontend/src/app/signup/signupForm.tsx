"use client"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import React, { useState } from "react"

export default function SignUpForm() {
  const [profilepic, setProfilepic] = React.useState<File | null>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState(""); 
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      setProfilepic(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true)
    setError(null)
    e.preventDefault();

    if (!email || !password || !firstName || !lastName) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }
    if (!profilepic) {
      setError("Please upload a profile picture.");
      setIsLoading(false);
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    const name = firstName + " " + lastName;
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("name", name);
    if (profilepic) {
      formData.append("profile_picture", profilepic);
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        body: formData,
      })      
      const data = await response.json()
      if(response.ok){
        console.log("File uploaded successfully:", data)
      } else {
        setError(data.message || "File upload failed. Please try again.")
      }
    } catch(err) {
      console.error("Error uploading file:", err);
    } finally {
      setIsLoading(false) 
    }
  }

  return (
    <div className="w-full flex flex-col md:flex-row justify-center items-center px-6 md:px-12 py-10 md:py-16 
      max-w-[90%] md:max-w-[80%] min-h-[700px] mx-auto gap-8 md:gap-12 rounded-2xl bg-background transition-colors duration-300">
      
      {/* Illustration side */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <img 
          src="register.jpg" 
          alt="register illustration" 
          className="w-full h-auto max-h-[600px] object-cover rounded-2xl"
        />
      </div>

      {/* Form side */}
      <Card className="w-full md:w-1/2 border border-red-900 bg-card backdrop-blur-md shadow-lg 
        hover:shadow-red-600/40 hover:border-red-600 transition-all duration-300">
        
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold text-red-600 dark:text-red-500 tracking-widest">
            CREATE YOUR ACCOUNT
          </CardTitle>

          <CardAction>
            <Button variant="link" className="text-red-500 dark:text-red-400 hover:text-red-600">
              <Link href={"/login"}>Already have an account? Login</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-red-600 dark:text-red-400">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tony@starkindustries.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 dark:bg-black/60 border-red-700 text-black dark:text-white placeholder-gray-400 
                    focus:ring-red-500 focus:border-red-500 hover:border-red-500 transition-all"
                />
              </div>

              {/* First & Last name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstname" className="text-red-600 dark:text-red-400">First Name</Label>
                  <Input 
                    id="firstname" 
                    type="text" 
                    placeholder="Peter" 
                    required 
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-gray-50 dark:bg-black/60 border-red-700 text-black dark:text-white placeholder-gray-400 
                      focus:ring-red-500 focus:border-red-500 hover:border-red-500 transition-all"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lastname" className="text-red-600 dark:text-red-400">Last Name</Label>
                  <Input 
                    id="lastname" 
                    type="text" 
                    placeholder="Parker" 
                    required 
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-gray-50 dark:bg-black/60 border-red-700 text-black dark:text-white placeholder-gray-400 
                      focus:ring-red-500 focus:border-red-500 hover:border-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-red-600 dark:text-red-400">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 dark:bg-black/60 border-red-700 text-black dark:text-white 
                    focus:ring-red-500 focus:border-red-500 hover:border-red-500 transition-all"
                />
              </div>

              {/* Profile Picture */}
              <div className="grid gap-2">
                <Label className="text-red-600 dark:text-red-400">Profile Picture</Label>
                <Input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="block w-full text-sm text-gray-800 dark:text-gray-200 border-red-700 bg-gray-50 dark:bg-black/60 rounded-md 
                    shadow-sm focus:ring-red-500 focus:border-red-500 hover:border-red-500 transition-all"
                />
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold 
              hover:shadow-[0_0_15px_rgba(255,0,0,0.8)] transition-all"
            onClick={handleSubmit}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>

          <Button 
            variant="outline" 
            className="w-full border-red-500 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white 
              hover:shadow-[0_0_10px_rgba(255,0,0,0.7)] transition-all"
          >
            Sign up with Google
          </Button>
        </CardFooter>

        {error && (
          <div className="text-red-500 dark:text-red-400 text-sm text-center p-2">{error}</div>
        )}
      </Card>
    </div>
  )
}
