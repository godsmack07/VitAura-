"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, LogOut, CheckCircle2 } from "lucide-react"

interface Ticket {
  id: string
  title: string
  description: string
  image: string
  status: "pending" | "assigned" | "in-progress" | "resolved"
  department: string
  userName: string
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [filter])

  const fetchTickets = async () => {
    try {
      const response = await fetch(`/api/admin/tickets?status=${filter}`)
      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (err) {
      console.error("Failed to fetch tickets:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchTickets()
      }
    } catch (err) {
      console.error("Failed to update ticket:", err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-700"
      case "assigned":
        return "bg-blue-50 border-blue-200 text-blue-700"
      case "in-progress":
        return "bg-orange-50 border-orange-200 text-orange-700"
      case "resolved":
        return "bg-green-50 border-green-200 text-green-700"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CivicAgent Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Department Dashboard</h1>
          <p className="text-muted-foreground">Manage and resolve citizen-reported issues</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["all", "pending", "assigned", "in-progress", "resolved"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className={filter === status ? "bg-primary hover:bg-primary/90" : ""}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
            </Button>
          ))}
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Tickets</h3>
              <p className="text-muted-foreground">All issues have been resolved!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="border-border overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row gap-4 p-6">
                    {/* Image */}
                    {ticket.image && (
                      <div className="w-full md:w-40 h-40 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={ticket.image || "/placeholder.svg"}
                          alt={ticket.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-foreground mb-1">{ticket.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                          {ticket.department}
                        </span>
                        <span className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                          By: {ticket.userName}
                        </span>
                        <span className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {ticket.status !== "resolved" && (
                          <>
                            {ticket.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => updateTicketStatus(ticket.id, "assigned")}
                                className="bg-primary hover:bg-primary/90"
                              >
                                Assign
                              </Button>
                            )}
                            {ticket.status === "assigned" && (
                              <Button
                                size="sm"
                                onClick={() => updateTicketStatus(ticket.id, "in-progress")}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                Start Work
                              </Button>
                            )}
                            {ticket.status === "in-progress" && (
                              <Button
                                size="sm"
                                onClick={() => updateTicketStatus(ticket.id, "resolved")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Mark Resolved
                              </Button>
                            )}
                          </>
                        )}
                        <span
                          className={`inline-block px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(ticket.status)}`}
                        >
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
