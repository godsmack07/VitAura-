"use client";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// 1. Added DropdownMenu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Plus,
  LogOut,
  Ticket,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Trash2, // Added delete icon
} from "lucide-react";

interface Issue {
  id: string;
  title: string;
  description: string;
  image: string;
  status: "pending" | "assigned" | "in-progress" | "resolved";
  department: string;
  createdAt: string;
}

// Kept fake data here to be used as a "seed"
const fakeIssues: Issue[] = [
  {
    id: "1",
    title: "Large pothole on 5th Ave",
    description: "Deep pothole causing traffic issues near the corner store.",
    image: "https://example.com/pothole.jpg",
    status: "pending",
    department: "Roads & Infra",
    createdAt: "2025-10-25T09:30:00Z",
  },
  {
    id: "2",
    title: "Flickering street light",
    description:
      "The street light at Oak St. and 2nd is dangerously flickering.",
    image: "https://example.com/light.jpg",
    status: "in-progress",
    department: "Electricity",
    createdAt: "2025-10-24T14:15:00Z",
  },
  {
    id: "3",
    title: "Overflowing garbage bin",
    description: "The public bin at Central Park is overflowing.",
    image: "https://example.com/bin.jpg",
    status: "assigned",
    department: "Sanitation",
    createdAt: "2025-10-24T11:00:00Z",
  },
  {
    id: "4",
    title: "Broken park bench",
    description: "A bench near the main fountain is broken and unsafe.",
    image: "https://example.com/bench.jpg",
    status: "resolved",
    department: "Parks & Rec",
    createdAt: "2025-10-22T17:45:00Z",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Modified state to be empty by default
  const [issues, setIssues] = useState<Issue[]>([]);
  // Set loading to true initially
  const [loading, setLoading] = useState(true);

  // Added useEffect to load issues from localStorage on mount
  useEffect(() => {
    // Get issues from storage
    const storedIssuesJSON = localStorage.getItem("allIssues");
    let issuesToShow: Issue[] = [];

    if (storedIssuesJSON) {
      // If storage exists, parse and use it
      issuesToShow = JSON.parse(storedIssuesJSON);
    } else {
      // If this is the first visit, seed storage with the fake data
      issuesToShow = fakeIssues;
      localStorage.setItem("allIssues", JSON.stringify(fakeIssues));
    }

    // Set the state with the issues (newest first)
    setIssues(issuesToShow.reverse());
    setLoading(false);
  }, []); // Empty dependency array means this runs once when the page loads

  // 2. Created the new handleDelete function
  const handleDelete = (idToDelete: string) => {
    // 1. Update localStorage (the source of truth)
    const storedIssues: Issue[] = JSON.parse(
      localStorage.getItem("allIssues") || "[]"
    );
    const updatedStoredIssues = storedIssues.filter(
      (issue) => issue.id !== idToDelete
    );
    localStorage.setItem("allIssues", JSON.stringify(updatedStoredIssues));

    // 2. Update local state (what the user sees)
    setIssues((prevIssues) =>
      prevIssues.filter((issue) => issue.id !== idToDelete)
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    // Also clear the issues cache on logout
    localStorage.removeItem("allIssues");
    router.push("/");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "assigned":
        return <Ticket className="w-4 h-4 text-blue-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "resolved":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");
  };

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
          <div className="flex items-center gap-4 scale-140">
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              My Issues
            </h1>
            <p className="text-muted-foreground">
              Track all your reported city issues
            </p>
          </div>
          <Link href="/dashboard/report">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Report New Issue
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Issues", value: issues.length, icon: Ticket },
            {
              label: "Pending",
              value: issues.filter((i) => i.status === "pending").length,
              icon: Clock,
            },
            {
              label: "In Progress",
              value: issues.filter((i) => i.status === "in-progress").length,
              icon: Clock,
            },
            {
              label: "Resolved",
              value: issues.filter((i) => i.status === "resolved").length,
              icon: CheckCircle2,
            },
          ].map((stat, idx) => (
            <Card key={idx} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Issues List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Issues Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start by reporting your first city issue
              </p>
              <Link href="/dashboard/report">
                <Button className="bg-primary hover:bg-primary/90">
                  Report an Issue
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[350px]">Issue Details</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <div className="font-medium">{issue.title}</div>
                      <div className="text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">
                        {issue.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{issue.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(issue.status)}
                        <span>{getStatusLabel(issue.status)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </TableCell>
                    {/* 3. Replaced Button with DropdownMenu */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => handleDelete(issue.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
