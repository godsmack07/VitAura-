"use client";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, MapPin, CheckCircle2, Users } from "lucide-react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="px-1 sm:px-1 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              SheharSudhar
            </span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2">
                  Sign up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center transform scale-140">
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* 2. Full-Screen Video Background */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          // Placeholder video path
        >
          <source src="/meow.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* 3. Dark Overlay for Readability */}
        {/* Ensures text stands out clearly against the moving video */}
        <div className="absolute inset-0 bg-black opacity-60"></div>

        {/* 4. Centered Content Container */}
        {/* The content is centered using the parent's flex properties (items-center justify-center) */}
        <div className="relative z-10 p-8 max-w-4xl mx-auto text-center">
          {/* The text colors are explicitly set to white/light colors (text-white/text-gray-200) 
              to contrast with the dark overlay. */}

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight text-balance">
              Your Voice for City Issues
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed text-balance drop-shadow-lg">
              Report city problems directly to the right departments. Upload
              photos, describe issues, and track resolution in real-time with
              AI-powered routing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center">
              {/* Report an Issue Button (Primary Style) */}
              <Link href="/dashboard/report">
                <Button
                  size="lg"
                  className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg w-full sm:w-auto"
                >
                  Report an Issue
                </Button>
              </Link>
              {/* Learn More Button (Outline/Ghost Style) */}
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-white text-white bg-white/10 hover:bg-white/20"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-linear-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of citizens helping improve their cities. Start
              reporting issues today.
            </p>
            <Link href="/dashboard/report">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Started Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
