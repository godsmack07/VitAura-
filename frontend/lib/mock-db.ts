// Shared mock database for all API routes
// In production, this would be replaced with a real database

export interface User {
  id: string
  name: string
  email: string
  password: string
  city: string
  createdAt: Date
}

export interface Issue {
  id: string
  title: string
  description: string
  category: string
  userId: string
  userName: string
  image: string
  status: "pending" | "assigned" | "in-progress" | "resolved"
  department: string
  createdAt: Date
  updatedAt?: Date
}

// Shared database instance
export const mockDB = {
  users: [] as User[],
  issues: [] as Issue[],
}

export function getUserByEmail(email: string) {
  return mockDB.users.find((u) => u.email === email)
}

export function createUser(user: User) {
  mockDB.users.push(user)
  return user
}

export function getIssuesByUserId(userId: string) {
  return mockDB.issues.filter((i) => i.userId === userId)
}

export function getAllIssues(status?: string) {
  if (status && status !== "all") {
    return mockDB.issues.filter((i) => i.status === status)
  }
  return mockDB.issues
}

export function createIssue(issue: Issue) {
  mockDB.issues.push(issue)
  return issue
}

export function updateIssueStatus(issueId: string, newStatus: string) {
  const issue = mockDB.issues.find((i) => i.id === issueId)
  if (issue) {
    issue.status = newStatus as any
    issue.updatedAt = new Date()
  }
  return issue
}
