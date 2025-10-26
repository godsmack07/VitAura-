"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Upload,
  ArrowLeft,
  Loader2,
  LocateFixed,
  CheckCircle2,
} from "lucide-react";

// 1. Copied the Issue interface from the dashboard
interface Issue {
  id: string;
  title: string;
  description: string;
  image: string;
  status: "pending" | "assigned" | "in-progress" | "resolved";
  department: string;
  createdAt: string;
}

export default function ReportIssuePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);

  // --- Updated State (Category removed) ---
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mobile: "",
    image: null as File | null,
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  // --------------------

  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> // Removed HTMLSelectElement
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- New Location Handler ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError("");
    setLocation(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      () => {
        setLocationError(
          "Unable to retrieve location. Please grant permission."
        );
        setLocationLoading(false);
      }
    );
  };
  // --------------------------

  // 2. NEW: Mock classification function
  // This simulates an AI model by checking for keywords in the text.
  const getMockClassification = (
    title: string,
    description: string
  ): string => {
    const combinedText = (title + " " + description).toLowerCase();

    if (
      combinedText.includes("garbage") ||
      combinedText.includes("trash") ||
      combinedText.includes("bin") ||
      combinedText.includes("hygiene")
    ) {
      return "Sanitation";
    }
    if (
      combinedText.includes("pothole") ||
      combinedText.includes("road") ||
      combinedText.includes("street")
    ) {
      return "Roads & Infra";
    }

    if (
      combinedText.includes("water") ||
      combinedText.includes("drainage") ||
      combinedText.includes("leak")
    ) {
      return "Water & Drainage";
    }
    if (
      combinedText.includes("light") ||
      combinedText.includes("lamp") ||
      combinedText.includes("electricity") ||
      combinedText.includes("power")
    ) {
      return "Electricity";
    }
    if (
      combinedText.includes("park") ||
      combinedText.includes("bench") ||
      combinedText.includes("green")
    ) {
      return "Parks & Rec";
    }
    return "Other"; // Default
  };

  // --- MODIFIED HANDLESUBMIT FUNCTION ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // --- Updated Validation (Category removed) ---
    if (
      !formData.title ||
      !formData.description ||
      !formData.image ||
      !formData.mobile ||
      !location
    ) {
      setError(
        "Please fill in all fields, upload an image, and provide a location"
      );
      setLoading(false);
      return;
    }
    // ------------------------

    // --- Fake Upload Simulation ---
    console.log("Simulating file upload...");

    setTimeout(() => {
      // 3. Get department from mock classification
      const department = getMockClassification(
        formData.title,
        formData.description
      );

      // 4. Create new issue and save to localStorage
      const newIssue: Issue = {
        id: new Date().getTime().toString(),
        title: formData.title,
        description: formData.description,
        image: preview, // Use the Data URL from the preview
        status: "pending",
        department: department, // Use the new auto-generated department
        createdAt: new Date().toISOString(),
      };

      // Get existing issues, or an empty array
      const existingIssues: Issue[] = JSON.parse(
        localStorage.getItem("allIssues") || "[]"
      );

      // Add the new issue
      const updatedIssues = [...existingIssues, newIssue];

      // Save the updated list back to storage
      localStorage.setItem("allIssues", JSON.stringify(updatedIssues));

      // --- Continue with success state ---
      setLoading(false);
      setSuccess(true);
      console.log(`Upload successful! Classified as: ${department}`);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }, 1500); // 1.5 second "upload" delay
  };
  // --- END OF MODIFIED FUNCTION ---

  // Removed 'categories' array

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              SheharSudhar
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content - Wider Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {success ? (
          <Card className="border-border">
            <CardContent className="p-12">
              <div className="p-6 rounded-lg bg-green-50 border border-green-200 text-center">
                <div className="text-green-600 font-semibold mb-2">
                  Issue Reported Successfully!
                </div>
                <p className="text-green-700 text-sm">
                  Your issue has been submitted and will be routed to the
                  appropriate department.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* --- New Two-Column Grid --- */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* --- Left Column (Form Fields) --- */}
              <Card className="border-border">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-3xl">
                    Report a City Issue
                  </CardTitle>
                  <CardDescription>
                    Provide details about the problem.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Issue Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Large pothole on Main Street"
                      value={formData.title}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>

                  {/* --- CATEGORY DROPDOWN REMOVED --- */}

                  {/* --- Mobile Number --- */}
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      placeholder="e.g., 9876543210"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Provide detailed information about the issue... (e.g., 'This garbage bin is overflowing')"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={loading}
                      rows={5}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* --- Right Column (Location & Image) --- */}
              <div className="space-y-8">
                {/* --- Location Card --- */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Issue Location</CardTitle>
                    <CardDescription>
                      Pinpoint the issue using your device's GPS.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                    >
                      {locationLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <LocateFixed className="w-4 h-4 mr-2" />
                      )}
                      {locationLoading
                        ? "Fetching Location..."
                        : "Get Current Location"}
                    </Button>

                    {/* Location Status Display */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border min-h-[60px] flex items-center justify-center">
                      {locationLoading && (
                        <p className="text-sm text-muted-foreground">
                          Waiting for location permission...
                        </p>
                      )}
                      {locationError && (
                        <p className="text-sm text-destructive">
                          {locationError}
                        </p>
                      )}
                      {location && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <p className="text-sm font-medium">
                            Location captured:{" "}
                            <span className="font-mono text-xs">
                              ({location.lat.toFixed(4)},{" "}
                              {location.lng.toFixed(4)})
                            </span>
                          </p>
                        </div>
                      )}
                      {!locationLoading && !locationError && !location && (
                        <p className="text-sm text-muted-foreground">
                          Location will appear here.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Image Upload Card */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Upload Photo</CardTitle>
                    <CardDescription>
                      A picture helps us understand the problem.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      {preview ? (
                        <div className="space-y-4">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button type="button" variant="outline" size="sm">
                            Change Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                          <p className="text-sm font-medium text-foreground">
                            Click to upload photo
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* --- Submit Button (Full Width) --- */}
            <div className="flex gap-4 mt-8">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Issue"
                )}
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
