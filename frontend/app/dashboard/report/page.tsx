"use client";

import type React from "react";
import { useState, useRef } from "react";
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
import { MapPin, Upload, ArrowLeft, Loader2 } from "lucide-react";

// 1. Added the Issue interface (copied from dashboard)
// This is needed to create the object for localStorage.
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

  // --- Updated State (Matches image keys) ---
  const [formData, setFormData] = useState({
    issue: "",
    description: "",
    location: "",
    mobileNo: "",
    image: null as File | null,
  });

  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  // --- MODIFIED HANDLESUBMIT FUNCTION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // --- Validation ---
    if (
      !formData.issue ||
      !formData.description ||
      !formData.location ||
      !formData.mobileNo ||
      !formData.image
    ) {
      setError(
        "Please fill in all fields (issue, description, location, mobile no) and upload an image."
      );
      setLoading(false);
      return;
    }

    // --- Create FormData to send ---
    const data = new FormData();
    data.append("images", formData.image);
    data.append("issue", formData.issue);
    data.append("location", formData.location);
    data.append("description", formData.description);
    data.append("mobileNo", formData.mobileNo);

    console.log("Submitting FormData to API...");

    try {
      // Step 1: Send data to your API
      const response = await fetch("http://localhost:3000/api/upload", {
        // Use relative path
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      // Step 2: Get the JSON response from the API
      const result = await response.json();
      console.log("API Response:", result);

      // Step 3: Extract the department text using the path you provided
      const department = result.candidates[0].content?.parts[0].text;

      if (!department) {
        console.error("Failed to parse department from response:", result);
        throw new Error("Could not parse department from API response.");
      }

      console.log(`AI Classified Department: ${department}`);

      // Step 4: Save the new issue to localStorage
      const newIssue: Issue = {
        id: new Date().getTime().toString(),
        title: formData.issue,
        description: formData.description,
        image: preview, // Use the Data URL from preview state
        status: "pending",
        department: department.trim(), // Use the AI-generated department
        createdAt: new Date().toISOString(),
      };

      const existingIssues: Issue[] = JSON.parse(
        localStorage.getItem("allIssues") || "[]"
      );
      const updatedIssues = [...existingIssues, newIssue];
      localStorage.setItem("allIssues", JSON.stringify(updatedIssues));

      // Step 5: Show success and redirect
      setLoading(false);
      setSuccess(true);
      console.log("Upload successful and saved to localStorage!");

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Submission failed:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      setLoading(false);
    }
  };
  // --- END OF MODIFIED FUNCTION ---

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted">
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
            {/* --- Two-Column Grid --- */}
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

                  {/* Issue (Renamed from Title) */}
                  <div className="space-y-2">
                    <Label htmlFor="issue">Issue</Label>
                    <Input
                      id="issue"
                      name="issue"
                      placeholder="e.g., Garbage overflowing at bus stop"
                      value={formData.issue}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>

                  {/* Mobile Number (Renamed from mobile to mobileNo) */}
                  <div className="space-y-2">
                    <Label htmlFor="mobileNo">Mobile Number</Label>
                    <Input
                      id="mobileNo"
                      name="mobileNo"
                      type="tel"
                      placeholder="e.g., 9876543210"
                      value={formData.mobileNo}
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
                {/* --- Location Card (CHANGED TO TEXT INPUT) --- */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Issue Location</CardTitle>
                    <CardDescription>
                      Please provide the address or area name.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Replaced button with a text input */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="e.g., Connaught Place, New Delhi"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
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
