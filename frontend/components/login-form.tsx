// src/components/login-form.tsx
"use client"

import { useState } from "react"
import { ShieldCheck, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "/Users/sn78/Downloads/Velink/frontend/src/services/firebase.js"

interface LoginFormProps {
  onLogin: () => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Show loading state and clear any previous errors
    setIsLoading(true)
    setError("")
    
    try {
      // Call the Firebase login function
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Store token in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', await userCredential.user.getIdToken())
        localStorage.setItem('user', JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || "User",
        }))
      }
      
      console.log("Login successful:", userCredential.user.uid)
      
      // If successful, call the onLogin callback
      onLogin()
    } catch (error: any) {
      console.error("Login failed:", error)
      
      // Handle different Firebase auth errors with user-friendly messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError("Invalid email or password")
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts, please try again later")
      } else if (error.code === 'auth/network-request-failed') {
        setError("Network error. Please check your connection")
      } else {
        setError(error.message || "An error occurred during login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle test login
  const handleTestLogin = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      // Use the test credentials - replace with your user's email
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        "future.databonnd@gmail.com", // Replace with your actual test user email
        "testpassword123" // Replace with your actual test user password
      )
      
      // Store token in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', await userCredential.user.getIdToken())
        localStorage.setItem('user', JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: "Admin User",
        }))
      }
      
      // If successful, call the onLogin callback
      onLogin()
    } catch (error: any) {
      console.error("Test login failed:", error)
      setError("Test login failed: " + (error.message || "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <ShieldCheck className="h-10 w-10 text-purple-600 mx-auto mb-2" />
          <CardTitle>Velink</CardTitle>
          <CardDescription>Network Security Monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display error message if login fails */}
            {error && (
              <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <Input 
              placeholder="Email" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={isLoading}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <div className="px-2 text-xs text-gray-500">FOR TESTING</div>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleTestLogin}
              disabled={isLoading}
            >
              <Info className="h-4 w-4 mr-2" />
              Test Login with Existing User
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}