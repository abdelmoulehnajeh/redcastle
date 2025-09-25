// Helper function to create user-specific table
async function createUserTable(username, id) {
  // Use username.toLowerCase() + '_' + id as table name (no trailing space)
  const tableName = `${username.toLowerCase()}_${id}`
  try {
    // Check if table already exists in information_schema.tables
    const existsRes = await pool.query(`SELECT 1 FROM information_schema.tables WHERE table_name = $1`, [tableName])
    if (existsRes.rows.length === 0) {
      try {
        await pool.query(`
          CREATE TABLE "${tableName}"
          (
              id serial,
              employee_id integer,
              date date NOT NULL,
              shift_type character varying(50) NOT NULL,
              job_position character varying(255),
              is_working boolean DEFAULT false,
              is_worked boolean DEFAULT false,
              start_time time without time zone,
              end_time time without time zone,
              created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
              day character varying(50),
              location_id integer,
              retard character varying(50),
              status character varying(50),
              traite character varying(50),
              CONSTRAINT "${tableName}_pkey" PRIMARY KEY (date)
          );
        `)
        await pool.query(
          `CREATE INDEX IF NOT EXISTS "idx_${tableName}_date" ON "${tableName}" USING btree (date ASC NULLS LAST);`,
        )
        await pool.query(
          `CREATE INDEX IF NOT EXISTS "idx_${tableName}_employee" ON "${tableName}" USING btree (id ASC NULLS LAST);`,
        )
      } catch (err) {
        // If duplicate key error, ignore (table/type already exists)
        if (err.code === "23505" && String(err.detail || "").includes("already exists")) {
          // Table/type already exists, safe to continue
        } else {
          throw err
        }
      }
    }
    return tableName
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error)
    throw new Error(`Failed to create user table: ${tableName}`)
  }
}

// Helper function to get user's table name
async function getUserTableName(employeeId) {
  try {
    const userRes = await pool.query("SELECT id, username, user_table_name FROM users WHERE employee_id = $1", [
      employeeId,
    ])
    if (userRes.rows.length === 0) {
      throw new Error("User not found for employee")
    }
    const user = userRes.rows[0]
    // Use username.toLowerCase() + '_' + id as table name (no trailing space)
    const tableName = `${user.username.toLowerCase()}_${user.id}`
    // If user_table_name is not set or is different, update it
    if (!user.user_table_name || user.user_table_name !== tableName) {
      await createUserTable(user.username, user.id)
      await pool.query("UPDATE users SET user_table_name = $1 WHERE employee_id = $2", [tableName, employeeId])
      return tableName
    }
    return user.user_table_name
  } catch (error) {
    console.error("Error getting user table name:", error)
    throw error
  }
}
import { ApolloServer } from "@apollo/server"
import { startServerAndCreateNextHandler } from "@as-integrations/next"
import { gql } from "graphql-tag"
import { Pool } from "pg"

// Database connection
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_PkV0ch8aUzKy@ep-super-shadow-adz5agx9-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
})
// Ensure payroll and notifications tables exist
async function ensureTables() {
  try {
    // Add user_table_name column to users table if it doesn't exist
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_table_name VARCHAR(255);`)
    await pool.query(`
    CREATE TABLE IF NOT EXISTS payroll_payments (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
      period TEXT NOT NULL,
      paid BOOLEAN NOT NULL DEFAULT false,
      paid_at TIMESTAMP,
      amount NUMERIC(10,2),
      hours_worked NUMERIC(10,2),
      CONSTRAINT payroll_payments_employee_period_uniq UNIQUE (employee_id, period)
    );
  `)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_payroll_payments_period ON payroll_payments (period);`)
    await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      type TEXT NOT NULL,
      reference_id TEXT,
      seen BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, seen, created_at DESC);`,
    )
  } catch (e) {
    console.error("Failed to ensure tables:", e)
  }
}
ensureTables().catch(console.error)

// Utility
async function logRecentActivity({
  title,
  description,
  type,
  urgent = false,
}: { title: string; description?: string; type: string; urgent?: boolean }) {
  try {
    await pool.query(`INSERT INTO recent_activities (title, description, type, urgent) VALUES ($1, $2, $3, $4)`, [
      title,
      description,
      type,
      urgent,
    ])
  } catch (err) {
    console.error("Failed to log recent activity:", err)
  }
}

async function createNotification({
  user_id,
  role,
  title,
  message,
  type,
  reference_id,
}: {
  user_id: number
  role: string
  title: string
  message?: string
  type: string
  reference_id?: string | number
}) {
  try {
    let processedReferenceId = null
    if (reference_id != null) {
      // If it's already a number, use it
      if (typeof reference_id === "number") {
        processedReferenceId = reference_id
      } else {
        // If it's a string, try to parse as integer, otherwise set to null
        const parsed = Number.parseInt(String(reference_id), 10)
        processedReferenceId = isNaN(parsed) ? null : parsed
      }
    }

    await pool.query(
      `INSERT INTO notifications (user_id, role, title, message, type, reference_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [user_id, role, title, message ?? null, type, processedReferenceId],
    )
  } catch (e) {
    console.error("Failed to create notification:", e)
  }
}

// ---- Helpers ----
function fmtMoney(value: any) {
  if (value === null || value === undefined || value === "") return "—"
  const num = Number(value)
  if (Number.isNaN(num)) return "—"
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num) + " DT"
  )
}

function fmtInt(value: any) {
  if (value === null || value === undefined || value === "") return "—"
  return String(value)
}

function arrow(oldVal: string, newVal: string) {
  return `${oldVal} → ${newVal}`
}

async function getLocationNames(oldId?: any, newId?: any) {
  const ids = [oldId, newId].filter(Boolean)
  if (ids.length === 0) {
    return { oldName: "—", newName: "—" }
  }
  const res = await pool.query("SELECT id, name FROM locations WHERE id = ANY($1)", [ids])
  const map = Object.fromEntries(res.rows.map((r: any) => [String(r.id), r.name]))
  const oldName = oldId ? map[String(oldId)] || String(oldId) : "—"
  const newName = newId ? map[String(newId)] || String(newId) : "—"
  return { oldName, newName }
}

function firstAndLastDateOfMonth(ym: string): { start: string; end: string } {
  // ym is "YYYY-MM"
  const first = new Date(`${ym}-01T00:00:00`)
  const last = new Date(first)
  last.setMonth(last.getMonth() + 1)
  last.setDate(0)
  const start = first.toISOString().slice(0, 10)
  const end = last.toISOString().slice(0, 10)
  return { start, end }
}

// Extend schema minimally: add notifyPlanningForEmployee mutation
const typeDefs = gql`
type Mutation {
  # ...existing mutation definitions...
  createOrUpdateManyUserWorkSchedules(users: [UserSchedulesInput!]!): Boolean!
  updateUserRole(user_id: ID!, role: String!): User
  createNotification(
    user_id: ID!
    role: String!
    title: String!
    message: String
    type: String!
    reference_id: String
    data: String
  ): Boolean!
  deleteWorkSchedule(id: ID!): Boolean!
}

input UserSchedulesInput {
  employee_id: String!
  schedules: [WorkScheduleInput!]!
}
type RecentActivity {
  id: ID!
  title: String!
  description: String
  type: String!
  urgent: Boolean
  created_at: String!
}

type User {
  id: ID!
  username: String!
  password: String!
  role: String!
  employee_id: String
  location_id: String
  user_table_name: String
  created_at: String
}

type Profile {
  first_name: String
  last_name: String
  phone: String
  address: String
  birth_date: String
  emergency_contact: String
}

type Employee {
  id: ID!
  username: String
  nom: String!
  prenom: String!
  email: String!
  telephone: String
  job_title: String
  location_id: String
  salaire: Float
  prime: Float
  infractions: Int
  absence: Int
  retard: Int
  avance: Float
  tenu_de_travail: Int
  status: String!
  role: String
  created_at: String
  price_j: Float
  location: Location
  employees: [Employee!]!
  profile: Profile
  user: User
}

type Location {
  id: ID!
  name: String!
  address: String!
  phone: String
  created_at: String
  latitude: String
  longitude: String
  manager: Employee
  employees: [Employee!]!
}

type Infraction {
  id: ID!
  name: String!
  description: String
  employee_id: ID!
  price: Float!
  created_date: String!
  dat: String!
  employee: Employee
}

type Absence {
id: ID!
name: String!
description: String
employee_id: ID!
price: Float!
created_date: String!
dat: String!
jsutif: Boolean
employee: Employee
}

type Retard {
  id: ID!
  name: String!
  description: String
  employee_id: ID!
  price: Float!
  created_date: String!
  dat: String!
  employee: Employee
}

type TenueTravail {
  id: ID!
  name: String!
  description: String
  employee_id: ID!
  price: Float!
  created_date: String!
  dat: String!
  employee: Employee
}

type WorkSchedule {
id: ID!
employee_id: String!
date: String!
start_time: String
end_time: String
shift_type: String!
job_position: String
is_working: Boolean!
is_worked: Boolean
created_at: String
location_id: String
day: String
retard: String
status: String
traite: String
employee: Employee
location: Location
}

type Contract {
  id: ID!
  employee_id: String!
  contract_type: String!
  start_date: String!
  end_date: String
  salary: Float!
  tenu_count: Int!
  documents: [String!]!
  status: String!
  created_at: String
  employee: Employee
}

type LeaveRequest {
  id: ID!
  employee_id: String!
  type: String!
  start_date: String!
  end_date: String!
  days_count: Int!
  reason: String
  status: String!
  manager_comment: String
  admin_comment: String
  created_at: String
  approved_by: Employee
  approved_at: String
  employee: Employee
}

type TimeEntry {
  id: ID!
  employee_id: String!
  clock_in: String
  clock_out: String
  break_duration: Int
  total_hours: Float
  date: String!
  status: String!
  location: Location
}

type DashboardStats {
  monthlyHours: Float
  weeklyHours: Float
  estimatedSalary: Float
  hourlyRate: Float
  remainingLeave: Int
  activeEmployees: Int
  totalEmployees: Int
  totalHours: Float
  pendingRequests: Int
  monthlyRevenue: Float
  revenueGrowth: Float
  recentActivity: [Activity!]!
}

type Activity {
  title: String!
  description: String!
  time: String!
  type: String!
}

type AdminApproval {
  id: ID!
  type: String!
  reference_id: ID!
  manager_id: ID!
  data: String!
  status: String!
  created_at: String!
}

type PayrollPayment {
  id: ID!
  employee_id: ID!
  period: String!
  paid: Boolean!
  paid_at: String
  amount: Float
  hours_worked: Float
}

type Notification {
  id: ID!
  user_id: ID!
  role: String!
  title: String!
  message: String
  type: String!
  reference_id: String
  seen: Boolean!
  created_at: String!
}

type Query {
  allUserWorkSchedules(start: String!, end: String!): [WorkSchedule!]!
  recentActivities(limit: Int): [RecentActivity!]!
  users: [User!]!
  user(id: ID!): User
  employees(locationId: ID): [Employee!]!
  employee(id: ID!): Employee
  locations: [Location!]!
  location(id: ID!): Location
  workSchedules(employee_id: ID, date: String): [WorkSchedule!]!
  workSchedulesRange(employee_id: ID!): [WorkSchedule!]!
  workSchedulesManager(start: String, end: String): [WorkSchedule!]!
  contracts(employee_id: ID): [Contract!]!
  leaveRequests(employee_id: ID, status: String): [LeaveRequest!]!
  timeEntries(employeeId: ID!, startDate: String, endDate: String): [TimeEntry!]!
  payrollPayments(period: String!): [PayrollPayment!]!
  payrollPayment(employee_id: ID!, period: String!): PayrollPayment
  dashboardStats(userId: ID!, role: String!): DashboardStats
  adminApprovals(status: String): [AdminApproval!]!
  notifications(user_id: ID!, role: String, only_unseen: Boolean): [Notification!]!
  infractions(employee_id: ID!, period: String): [Infraction!]!
  absences(employee_id: ID!, period: String): [Absence!]!
  retards(employee_id: ID!, period: String): [Retard!]!
  tenuesTravail(employee_id: ID!): [TenueTravail!]!
  weeklyTemplateSchedules: [WorkSchedule!]!
  todayWorkSchedule(employee_id: ID!, date: String!): [WorkSchedule!]!
  employeesByDate(date: String!): [WorkSchedule!]!
}

type Mutation {
  login(username: String!, password: String!): User
  createUser(username: String!, password: String!, role: String!, employee_id: String): User
  updateEmployee(
    id: ID!
    salaire: Float
    prime: Float
    infractions: Int
    absence: Int
    retard: Int
    avance: Float
    tenu_de_travail: Int
    status: String
    price_j: Float
  ): Employee
  createWorkSchedule(
    employee_id: ID!
    date: String!
    start_time: String
    end_time: String
    shift_type: String!
    job_position: String!
    is_working: Boolean!
    location_id: ID!
  ): WorkSchedule

  createUserWorkSchedule(
    employee_id: ID!
    schedules: [WorkScheduleInput!]!
  ): Boolean!
  updateWorkSchedule(
    id: ID!
    start_time: String
    end_time: String
    shift_type: String
    job_position: String
    is_working: Boolean
  ): WorkSchedule
  createLeaveRequest(
    employee_id: ID!
    type: String!
    start_date: String!
    end_date: String!
    reason: String
  ): LeaveRequest
  approveLeaveRequest(id: ID!, status: String!, comment: String): LeaveRequest
  createContract(
    employee_id: ID!
    contract_type: String!
    start_date: String!
    end_date: String
    salary: Float!
    tenu_count: Int
    documents: [String]
  ): Contract
  createEmployee(
    username: String!
    email: String!
    nom: String!
    prenom: String!
    telephone: String
    job_title: String!
    salaire: Float
    role: String
    location_id: ID
  ): Employee
  deleteEmployee(id: ID!): Boolean
  clockIn(employeeId: ID!, locationId: ID!): TimeEntry
  clockOut(timeEntryId: ID!): TimeEntry
  createManagerWorkSchedule(
    employee_id: ID!
    schedules: [WorkScheduleInput!]!
  ): [WorkSchedule!]!
  sendApprovalRequest(
    type: String!
    reference_id: ID
    manager_id: ID
    employee_id: ID
    month: String
    data: String!
  ): Boolean!
  approveManagerSchedule(approval_id: ID!): Boolean!
  rejectManagerSchedule(approval_id: ID!): Boolean!
  approveScheduleChange(approval_id: ID!): Boolean!
  rejectScheduleChange(approval_id: ID!, comment: String): Boolean!
  paySalary(employee_id: ID!, period: String!): PayrollPayment!

  markNotificationSeen(id: ID!): Boolean!
  markAllNotificationsSeen(user_id: ID!): Boolean!
  notifyPlanningForEmployee(employee_id: ID!, month: String!): Boolean!
  updateEmployeeProfile(
    id: ID!
    nom: String
    prenom: String
    email: String
    telephone: String
    job_title: String
    location_id: Int
  ): Employee
  updateUserPassword(
    employee_id: ID!
    currentPassword: String!
    newPassword: String!
  ): User
  updateUserInfo(
    employee_id: ID!
    username: String
    hire_date: String
  ): User
  createInfraction(
    employee_id: ID!
    name: String!
    description: String
    price: Float!
    dat: String
  ): Infraction
  deleteInfraction(id: ID!): Boolean!
  createAbsence(
    employee_id: ID!
    name: String!
    description: String
    price: Float!
    dat: String
  ): Absence
  deleteAbsence(id: ID!): Boolean!
  createRetard(
    employee_id: ID!
    name: String!
    description: String
    price: Float!
    dat: String
  ): Retard
  deleteRetard(id: ID!): Boolean!
  createTenueTravail(
    employee_id: ID!
    name: String!
    description: String
    price: Float!
  ): TenueTravail
  deleteTenueTravail(id: ID!): Boolean!
  deleteWorkSchedulesByEmployee(employee_id: ID!): Boolean!
}

input WorkScheduleInput {
  employee_id: String!
  date: String!
  start_time: String
  end_time: String
  shift_type: String!
  job_position: String
  is_working: Boolean!
  location_id: String
  day: String
  retard: String
  status: String
}
`

// Compose resolvers by extending your previous ones:
const resolvers = {
  Query: {
    weeklyTemplateSchedules: async () => {
      try {
        // Fetch the 7-day template from work_schedules table for all employees
        const result = await pool.query(
          `SELECT ws.*, e.nom, e.prenom, e.id as employee_id, l.id as location_id, l.name as location_name, l.address as location_address
           FROM work_schedules ws
           LEFT JOIN employees e ON ws.employee_id = e.id
           LEFT JOIN locations l ON ws.location_id = l.id
           WHERE e.status = 'active' or e.status = 'inactive'
           ORDER BY ws.employee_id ASC`,
        )

        return result.rows.map((row) => ({
          ...row,
          employee_id: String(row.employee_id),
          day: row.day || new Date(row.date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase(),
          employee: {
            id: String(row.employee_id),
            nom: row.nom || "",
            prenom: row.prenom || "",
          },
          location: row.location_id
            ? {
                id: String(row.location_id),
                name: row.location_name || "",
                address: row.location_address || "",
              }
            : null,
        }))
      } catch (error) {
        console.error("Error fetching weekly template schedules:", error)
        return []
      }
    },

    // Query: fetch all work schedules for all employees for a date range from the shared work_schedules table
    allUserWorkSchedules: async (_: any, { start, end }: { start: string; end: string }) => {
      try {
        // Get all employees
        const employeesRes = await pool.query("SELECT id, nom, prenom FROM employees WHERE status = 'active' or status = 'inactive'")
        const employees = employeesRes.rows
        // Build all dates in range
        const startDate = new Date(start)
        const endDate = new Date(end)
        const days = []
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          days.push(new Date(d))
        }
        // Fetch all work_schedules in range
        const result = await pool.query(
          `SELECT ws.*, e.nom, e.prenom, e.id as employee_id, l.id as location_id, l.name as location_name, l.address as location_address
           FROM work_schedules ws
           LEFT JOIN employees e ON ws.employee_id = e.id
           LEFT JOIN locations l ON ws.location_id = l.id
           WHERE ws.date BETWEEN $1 AND $2
           ORDER BY ws.date ASC`,
          [start, end],
        )
        const rows = result.rows
        // For each employee and each day, ensure there is a row (fill with 'Repos' if missing)
        const resultRows = []
        for (const emp of employees) {
          for (const d of days) {
            const ymd = d.toISOString().slice(0, 10)
            const found = rows.find(
              (r) => String(r.employee_id) === String(emp.id) && r.date.toISOString().slice(0, 10) === ymd,
            )
            if (found) {
              resultRows.push({
                ...found,
                employee_id: String(emp.id),
                employee: {
                  id: String(emp.id),
                  nom: emp.nom || "",
                  prenom: emp.prenom || "",
                },
                location: found.location_id
                  ? {
                      id: String(found.location_id),
                      name: found.location_name || "",
                      address: found.location_address || "",
                    }
                  : null,
              })
            } else {
              resultRows.push({
                id: `virtual-${emp.id}-${ymd}`,
                employee_id: String(emp.id),
                date: ymd,
                start_time: null,
                end_time: null,
                shift_type: "Repos",
                job_position: null,
                is_working: false,
                location_id: null,
                day: new Date(ymd).toLocaleDateString("en-US", { weekday: "long" }),
                retard: null,
                status: "active",
                created_at: null,
                employee: {
                  id: String(emp.id),
                  nom: emp.nom || "",
                  prenom: emp.prenom || "",
                },
                location: null,
              })
            }
          }
        }
        return resultRows
      } catch (error) {
        console.error("Error fetching all work schedules:", error)
        return []
      }
    },
    recentActivities: async (_: any, { limit = 10 }: { limit?: number } = {}) => {
      try {
        const result = await pool.query(
          `SELECT id, title, description, type, urgent, created_at
         FROM recent_activities
         ORDER BY created_at DESC
         LIMIT $1`,
          [limit],
        )
        return result.rows
      } catch (error) {
        console.error("Error fetching recent activities:", error)
        return []
      }
    },
    adminApprovals: async (_: any, { status }: { status?: string }) => {
      try {
        let query = "SELECT * FROM admin_approvals"
        const params: any[] = []
        if (status) {
          query += " WHERE status = $1"
          params.push(status)
        }
        query += " ORDER BY created_at DESC"
        const result = await pool.query(query, params)
        return result.rows
      } catch (error) {
        console.error("Error fetching admin approvals:", error)
        return []
      }
    },
    users: async () => {
      try {
        const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC")
        return result.rows
      } catch (error) {
        console.error("Error fetching users:", error)
        return []
      }
    },
    user: async (_: any, { id }: { id: string }) => {
      try {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [id])
        return result.rows[0]
      } catch (error) {
        console.error("Error fetching user:", error)
        return null
      }
    },
    employees: async (_: any, { locationId }: { locationId?: string }) => {
      try {
        let query = `
        SELECT e.*, l.name as location_name, l.address as location_address
        FROM employees e
        LEFT JOIN locations l ON e.location_id = l.id
      `
        const params: any[] = []
        if (locationId) {
          query += " WHERE e.location_id = $1"
          params.push(locationId)
        }
        query += " ORDER BY e.created_at DESC"

        const result = await pool.query(query, params)
        return result.rows.map((row) => ({
          ...row,
          location: row.location_name
            ? {
                id: row.location_id,
                name: row.location_name,
                address: row.location_address,
              }
            : null,
          profile: {
            first_name: row.prenom,
            last_name: row.nom,
            phone: row.telephone,
            address: null,
          },
        }))
      } catch (error) {
        console.error("Error fetching employees:", error)
        return []
      }
    },
    employee: async (_: any, { id }: { id: string }) => {
      try {
        const result = await pool.query(
          `
        SELECT e.*, l.name as location_name, l.address as location_address
        FROM employees e
        LEFT JOIN locations l ON e.location_id = l.id
        WHERE e.id = $1
      `,
          [id],
        )
        if (result.rows.length === 0) return null
        const row = result.rows[0]
        return {
          ...row,
          location: row.location_name
            ? {
                id: row.location_id,
                name: row.location_name,
                address: row.location_address,
              }
            : null,
          profile: {
            first_name: row.prenom,
            last_name: row.nom,
            phone: row.telephone,
            address: null,
          },
        }
      } catch (error) {
        console.error("Error fetching employee:", error)
        return null
      }
    },
    locations: async () => {
      try {
        const locationsResult = await pool.query("SELECT * FROM locations ORDER BY name")
        const locations = locationsResult.rows
        const locationsWithDetails = await Promise.all(
          locations.map(async (location) => {
            const employeesResult = await pool.query(
              "SELECT id, nom, prenom, email, telephone, job_title, status, salaire FROM employees WHERE location_id = $1",
              [location.id],
            )
            const managerResult = await pool.query(
              "SELECT id, nom, prenom, email FROM employees WHERE location_id = $1 AND job_title LIKE '%manager%' LIMIT 1",
              [location.id],
            )
            const manager = managerResult.rows[0]
              ? {
                  id: managerResult.rows[0].id,
                  profile: {
                    first_name: managerResult.rows[0].prenom,
                    last_name: managerResult.rows[0].nom,
                  },
                }
              : null
            return {
              ...location,
              employees: employeesResult.rows.map((emp) => ({
                ...emp,
                profile: {
                  first_name: emp.prenom,
                  last_name: emp.nom,
                  phone: emp.telephone,
                },
              })),
              manager,
            }
          }),
        )
        return locationsWithDetails
      } catch (error) {
        console.error("Error fetching locations:", error)
        return []
      }
    },
    location: async (_: any, { id }: { id: string }) => {
      try {
        const locationResult = await pool.query("SELECT * FROM locations WHERE id = $1", [id])
        if (locationResult.rows.length === 0) return null
        const location = locationResult.rows[0]
        const employeesResult = await pool.query(
          "SELECT id, nom, prenom, email, telephone, job_title, status, salaire, created_at FROM employees WHERE location_id = $1",
          [id],
        )
        const managerResult = await pool.query(
          "SELECT id, nom, prenom, email FROM employees WHERE location_id = $1 AND job_title LIKE '%manager%' LIMIT 1",
          [id],
        )
        const manager = managerResult.rows[0]
          ? {
              id: managerResult.rows[0].id,
              profile: {
                first_name: managerResult.rows[0].prenom,
                last_name: managerResult.rows[0].nom,
              },
            }
          : null
        return {
          ...location,
          employees: employeesResult.rows.map((emp) => ({
            ...emp,
            profile: {
              first_name: emp.prenom,
              last_name: emp.nom,
              phone: emp.telephone,
            },
          })),
          manager,
        }
      } catch (error) {
        console.error("Error fetching location:", error)
        return null
      }
    },
    workSchedules: async (_: any, { employee_id, date }: any) => {
      try {
        if (!employee_id) {
          throw new Error("employee_id is required to fetch work schedules.")
        }
        // Get the correct per-user table name
        const tableName = await getUserTableName(employee_id)
        let query = `SELECT id, employee_id, date, shift_type, job_position, is_working, is_worked, start_time, end_time, created_at, day, location_id, retard, status, traite FROM "${tableName}"`
        const params = []
        if (date) {
          params.push(date)
          query += ` WHERE date = $${params.length}`
        }
        query += " ORDER BY date DESC"
        const result = await pool.query(query, params)
        //console.log("[workSchedules] Fetched work schedules:", result.rows)
        return result.rows
      } catch (error) {
        console.error("Error fetching work schedules:", error)
        throw new Error("Failed to fetch work schedules")
      }
    },
    todayWorkSchedule: async (_: any, { employee_id, date }: { employee_id: string; date: string }) => {
      try {
        if (!employee_id || !date) {
          throw new Error("employee_id and date are required to fetch today's work schedule.")
        }
        // Get the correct per-user table name
        const tableName = await getUserTableName(employee_id)

        const query = `SELECT id, employee_id, date, shift_type, job_position, is_working, is_worked, start_time, end_time, created_at, day, location_id, retard, status, traite FROM "${tableName}" WHERE date = $1`
        const result = await pool.query(query, [date])

        //console.log("[todayWorkSchedule] Fetched today's work schedule:", result.rows)
        return result.rows
      } catch (error) {
        console.error("Error fetching today's work schedule:", error)
        throw new Error("Failed to fetch today's work schedule")
      }
    },
    workSchedulesRange: async (_: any, { employee_id }: { employee_id: string }) => {
      try {
        //console.log("[workSchedulesRange] Fetching work schedules for employee_id:", employee_id)
        const tableName = await getUserTableName(employee_id)
        //console.log("[workSchedulesRange] dssssssssUsing table name:", tableName)
        // Fetch all rows for this employee in the per-user table, exactly as saved
        const result = await pool.query(`SELECT * FROM "${tableName}" WHERE employee_id = $1 ORDER BY date ASC`, [
          employee_id,
        ])
        // DEBUG: Log the table name and all rows fetched
        //console.log("[workSchedulesRange] RAW DB rows for", tableName, ":", result.rows)

        return result.rows
      } catch (error) {
        console.error("Error fetching work schedules range:", error)
        throw new Error("Failed to fetch work schedules range")
      }
    },
    workSchedulesManager: async (_: any, { start, end }: { start?: string; end?: string }) => {
      try {
        let query = `SELECT ws.*, e.nom, e.prenom, e.id as employee_id, l.id as location_id, l.name as location_name, l.address as location_address
                     FROM work_schedules ws
                     LEFT JOIN employees e ON ws.employee_id = e.id
                     LEFT JOIN locations l ON ws.location_id = l.id
                     WHERE 1=1`
        const params: any[] = []

        if (start) {
          params.push(start)
          query += ` AND ws.date >= $${params.length}`
        }

        if (end) {
          params.push(end)
          query += ` AND ws.date <= $${params.length}`
        }

        query += " ORDER BY ws.date ASC"

        const result = await pool.query(query, params)

        return result.rows.map((row) => ({
          ...row,
          location: row.location_name
            ? {
                id: row.location_id,
                name: row.location_name,
                address: row.location_address,
              }
            : null,
        }))
      } catch (error) {
        console.error("Error fetching manager work schedules:", error)
        throw new Error("Failed to fetch manager work schedules")
      }
    },
    contracts: async (_: any, { employee_id }: { employee_id?: string }) => {
      try {
        let query = `
        SELECT c.*, e.nom, e.prenom
        FROM contracts c
        LEFT JOIN employees e ON c.employee_id = e.id
      `
        const params: any[] = []
        if (employee_id) {
          query += " WHERE c.employee_id = $1"
          params.push(employee_id)
        }
        query += " ORDER BY c.created_at DESC"
        const result = await pool.query(query, params)
        return result.rows.map((row) => ({
          ...row,
          documents: row.documents || [],
          employee: row.nom
            ? {
                id: row.employee_id,
                nom: row.nom,
                prenom: row.prenom,
                profile: {
                  first_name: row.prenom,
                  last_name: row.nom,
                },
              }
            : null,
        }))
      } catch (error) {
        console.error("Error fetching contracts:", error)
        return []
      }
    },
    leaveRequests: async (_: any, { employee_id, status }: { employee_id?: string; status?: string }) => {
      try {
        let query = `
        SELECT lr.*, e.nom, e.prenom
        FROM leave_requests lr
        LEFT JOIN employees e ON lr.employee_id = e.id
      `
        const params: any[] = []
        const conditions: string[] = []
        if (employee_id) {
          conditions.push(`lr.employee_id = $${params.length + 1}`)
          params.push(employee_id)
        }
        if (status) {
          conditions.push(`lr.status = $${params.length + 1}`)
          params.push(status)
        }
        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ")
        }
        query += " ORDER BY lr.created_at DESC"
        const result = await pool.query(query, params)
        return result.rows.map((row) => ({
          ...row,
          employee: row.nom
            ? {
                id: row.employee_id,
                nom: row.nom,
                prenom: row.prenom,
                profile: {
                  first_name: row.prenom,
                  last_name: row.nom,
                },
              }
            : null,
        }))
      } catch (error) {
        console.error("Error fetching leave requests:", error)
        return []
      }
    },
    timeEntries: async (
      _: any,
      { employeeId, startDate, endDate }: { employeeId: string; startDate?: string; endDate?: string },
    ) => {
      try {
        let query = `
        SELECT te.*, l.name as location_name
        FROM time_entries te
        LEFT JOIN locations l ON te.location_id = l.id
        WHERE te.employee_id = $1
      `
        const params: any[] = [employeeId]
        if (startDate && endDate) {
          query += " AND te.date BETWEEN $2 AND $3"
          params.push(startDate, endDate)
        }
        query += " ORDER BY te.date ASC"
        const result = await pool.query(query, params)
        return result.rows.map((row) => ({
          ...row,
          location: row.location_name
            ? {
                id: row.location_id,
                name: row.location_name,
              }
            : null,
        }))
      } catch (error) {
        console.error("Error fetching time entries:", error)
        return []
      }
    },
    payrollPayments: async (_: any, { period }: { period: string }) => {
      try {
        const res = await pool.query(
          "SELECT id, employee_id, period, paid, paid_at, amount, hours_worked FROM payroll_payments WHERE period = $1",
          [period],
        )
        return res.rows
      } catch (e) {
        console.error("Error fetching payrollPayments:", e)
        return []
      }
    },
    payrollPayment: async (_: any, { employee_id, period }: { employee_id: string; period: string }) => {
      try {
        const res = await pool.query(
          "SELECT id, employee_id, period, paid, paid_at, amount, hours_worked FROM payroll_payments WHERE employee_id = $1 AND period = $2",
          [employee_id, period],
        )
        return res.rows[0] || null
      } catch (e) {
        console.error("Error fetching payrollPayment:", e)
        return null
      }
    },
    dashboardStats: async (_: any, { userId, role }: { userId: string; role: string }) => {
      try {
        const totalEmployeesResult = await pool.query("SELECT COUNT(*) FROM employees")
        const totalEmployees = Number.parseInt(totalEmployeesResult.rows[0].count, 10)
        const activeEmployeesResult = await pool.query("SELECT COUNT(*) FROM employees WHERE status = 'active'")
        const activeEmployees = Number.parseInt(activeEmployeesResult.rows[0].count, 10)
        const pendingRequestsResult = await pool.query("SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'")
        const pendingRequests = Number.parseInt(pendingRequestsResult.rows[0].count, 10)
        const monthlyHoursResult = await pool.query(
          "SELECT SUM(total_hours) as sum_hours FROM time_entries WHERE date >= date_trunc('month', CURRENT_DATE)",
        )
        const monthlyHours = Number.parseFloat(monthlyHoursResult.rows[0].sum_hours) || 0
        const weeklyHoursResult = await pool.query(
          "SELECT SUM(total_hours) as sum_hours FROM time_entries WHERE date >= date_trunc('week', CURRENT_DATE)",
        )
        const weeklyHours = Number.parseFloat(weeklyHoursResult.rows[0].sum_hours) || 0
        const totalHoursResult = await pool.query("SELECT SUM(total_hours) as sum_hours FROM time_entries")
        const totalHours = Number.parseFloat(totalHoursResult.rows[0].sum_hours) || 0
        const estimatedSalaryResult = await pool.query(
          "SELECT SUM(salary) as sum_salary FROM contracts WHERE status = 'active'",
        )
        const estimatedSalary = Number.parseFloat(estimatedSalaryResult.rows[0].sum_salary) || 0
        const hourlyRateResult = await pool.query(
          "SELECT AVG(salary/160) as avg_hourly FROM contracts WHERE status = 'active'",
        )
        const hourlyRate = Number.parseFloat(hourlyRateResult.rows[0].avg_hourly) || 0
        const remainingLeaveResult = await pool.query(`
        SELECT SUM(remaining) as total_remaining FROM (
          SELECT 15 - COALESCE(SUM(days_count),0) AS remaining
          FROM employees e
          LEFT JOIN leave_requests lr ON lr.employee_id = e.id AND lr.status IN ('pending','manager_approved','admin_approved')
          WHERE e.status = 'active'
          GROUP BY e.id
        ) sub
      `)
        const remainingLeave = Number.parseInt(remainingLeaveResult.rows[0].total_remaining, 10) || 0
        const monthlyRevenueResult = await pool.query(
          "SELECT SUM(salary) as revenue FROM contracts WHERE start_date >= date_trunc('month', CURRENT_DATE)",
        )
        const monthlyRevenue = Number.parseFloat(monthlyRevenueResult.rows[0].revenue) || 0
        const prevMonthRevenueResult = await pool.query(
          "SELECT SUM(salary) as revenue FROM contracts WHERE start_date >= date_trunc('month', CURRENT_DATE - interval '1 month') AND start_date < date_trunc('month', CURRENT_DATE)",
        )
        const prevMonthRevenue = Number.parseFloat(prevMonthRevenueResult.rows[0].revenue) || 0
        const revenueGrowth = prevMonthRevenue > 0 ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0

        const recentEmployeesResult = await pool.query(
          "SELECT nom, prenom, created_at FROM employees ORDER BY created_at DESC LIMIT 3",
        )
        const recentLeaveRequestsResult = await pool.query(
          "SELECT type, reason, created_at FROM leave_requests ORDER BY created_at DESC LIMIT 2",
        )
        const recentActivity = [
          ...recentEmployeesResult.rows.map((row) => ({
            title: "Nouvel employé ajouté",
            description: `${row.prenom} ${row.nom}`,
            time: row.created_at,
            type: "employee",
          })),
          ...recentLeaveRequestsResult.rows.map((row) => ({
            title: `Demande de congé (${row.type})`,
            description: row.reason || "--",
            time: row.created_at,
            type: "leave_request",
          })),
        ]

        return {
          monthlyHours,
          weeklyHours,
          estimatedSalary,
          hourlyRate,
          remainingLeave,
          activeEmployees,
          totalEmployees,
          totalHours,
          pendingRequests,
          monthlyRevenue,
          revenueGrowth,
          recentActivity,
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return null
      }
    },
    notifications: async (_: any, { user_id, only_unseen }: { user_id: string; only_unseen?: boolean }) => {
      try {
        let q = `SELECT * FROM notifications WHERE user_id = $1`
        const params: any[] = [user_id]
        if (only_unseen === true) {
          q += ` AND seen = false`
        }
        q += ` ORDER BY created_at DESC LIMIT 100`
        const res = await pool.query(q, params)
        return res.rows
      } catch (e) {
        console.error("Error fetching notifications:", e)
        return []
      }
    },

    infractions: async (_: any, { employee_id, period }: { employee_id: string; period?: string }) => {
      try {
        if (period) {
          const likeRef = `${period}%`
          //console.log("eeee", { employee_id, likeRef })

          const q = `SELECT * FROM infractions
                     WHERE employee_id = $1
                       AND dat::text LIKE $2
                     ORDER BY dat DESC`
          const result = await pool.query(q, [employee_id, likeRef])
          //console.log("rrrr", result.rows)
          return result.rows
        } else {
          const result = await pool.query(
            "SELECT * FROM infractions WHERE employee_id = $1 ORDER BY created_date DESC",
            [employee_id],
          )
          return result.rows
        }
      } catch (error) {
        console.error("Error fetching infractions:", error)
        return []
      }
    },
    absences: async (_: any, { employee_id, period }: { employee_id: string; period?: string }) => {
      try {
        if (period) {
          const likeRef = `${period}%`
          const q = `SELECT * FROM absences
                     WHERE employee_id = $1
                       AND dat::text LIKE $2
                     ORDER BY dat DESC`
          const result = await pool.query(q, [employee_id, likeRef])
          return result.rows
        } else {
          const result = await pool.query("SELECT * FROM absences WHERE employee_id = $1 ORDER BY created_date DESC", [
            employee_id,
          ])
          return result.rows
        }
      } catch (error) {
        console.error("Error fetching absences:", error)
        return []
      }
    },
    retards: async (_: any, { employee_id, period }: { employee_id: string; period?: string }) => {
      try {
        if (period) {
          const likeRef = `${period}%`

          const q = `SELECT * FROM retards
                     WHERE employee_id = $1
                       AND dat::text LIKE $2
                     ORDER BY dat DESC`
          const result = await pool.query(q, [employee_id, likeRef])
          return result.rows
        } else {
          const result = await pool.query("SELECT * FROM retards WHERE employee_id = $1 ORDER BY created_date DESC", [
            employee_id,
          ])
          return result.rows
        }
      } catch (error) {
        console.error("Error fetching retards:", error)
        return []
      }
    },
    tenuesTravail: async (_: any, { employee_id }: { employee_id: string }) => {
      try {
        const result = await pool.query(
          "SELECT * FROM tenues_de_travail WHERE employee_id = $1 ORDER BY created_date DESC",
          [employee_id],
        )
        return result.rows
      } catch (error) {
        console.error("Error fetching tenues de travail:", error)
        return []
      }
    },
    employeesByDate: async (_: any, { date }: { date: string }) => {
      try {
        if (!date) {
          throw new Error("date is required to fetch employees by date.")
        }


        // Get all employees first
        const employeesResult = await pool.query("SELECT employee_id, username FROM users ")
        const employees = employeesResult.rows

        const allSchedules = []

        // For each employee, check their personal schedule table
        for (const employee of employees) {
          try {
            const tableName = await getUserTableName(employee.employee_id)
            const query = `SELECT id, employee_id, date, shift_type, job_position, is_working, is_worked, start_time, end_time, created_at, day, location_id, retard, status, traite FROM "${tableName}" WHERE date = $1 AND is_working = true`
            const result = await pool.query(query, [date])

            // Add employee info to each schedule
            for (const schedule of result.rows) {
              allSchedules.push({
                ...schedule,
                employee: {
                  id: employee.id,
                  username: employee.username,
                },
              })
            }
          } catch (error) {
            console.error(`Error fetching schedule for employee ${employee.id}:`, error)
            // Continue with other employees even if one fails
          }
        }

        //console.log("[employeesByDate] Found schedules:", allSchedules.length)
        return allSchedules
      } catch (error) {
        console.error("Error fetching employees by date:", error)
        throw new Error("Failed to fetch employees by date")
      }
    },
  },
  Mutation: {
    createNotification: async (_: any, { user_id, role, title, message, type, reference_id, data }) => {
      try {
        let processedReferenceId = null
        if (reference_id != null) {
          if (typeof reference_id === "number") {
            processedReferenceId = reference_id
          } else {
            const parsed = Number.parseInt(String(reference_id), 10)
            processedReferenceId = isNaN(parsed) ? null : parsed
          }
        }
        let notificationData = data
        try {
          if (typeof notificationData !== "string" && notificationData !== null && notificationData !== undefined) {
            notificationData = JSON.stringify(notificationData)
          }
        } catch (e) {
          notificationData = String(notificationData)
        }
        await pool.query(
          `INSERT INTO notifications (user_id, role, title, message, type, reference_id, data) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [user_id, role, title, message ?? null, type, processedReferenceId, notificationData],
        )
        return true
      } catch (e) {
        console.error("Failed to create notification:", e)
        return false
      }
    },
    updateUserRole: async (_: any, { user_id, role }: { user_id: string; role: string }) => {
      try {
        const result = await pool.query("UPDATE users SET role = $1 WHERE id = $2 RETURNING id, role", [role, user_id])
        if (result.rows.length === 0) throw new Error("User not found")
        await logRecentActivity({
          title: "Rôle utilisateur modifié",
          description: `Utilisateur ${user_id} rôle mis à jour: ${role}`,
          type: "employee",
          urgent: false,
        })
        return result.rows[0]
      } catch (error) {
        console.error("Error updating user role:", error)
        throw new Error("Failed to update user role")
      }
    },
    // Batch mutation: save/update planning for multiple users
    createOrUpdateManyUserWorkSchedules: async (_: any, { users }: any) => {
      try {
        if (!Array.isArray(users) || users.length === 0) throw new Error("users array required")
        for (const user of users) {
          const { employee_id, schedules } = user
          if (!employee_id || !Array.isArray(schedules) || schedules.length === 0) continue
          await resolvers.Mutation.createUserWorkSchedule(_, { employee_id, schedules })
        }
        return true
      } catch (error) {
        console.error("Error in createOrUpdateManyUserWorkSchedules:", error)
        throw new Error("Failed to save/update many user work schedules")
      }
    },
    // Enhanced mutation: Save full plan in per-user table, only current week in work_schedules
    createUserWorkSchedule: async (_: any, args: any) => {
      // args: { employee_id, schedules: [ {date, start_time, end_time, ...} ] }
      try {
        const { employee_id, schedules } = args
        if (!Array.isArray(schedules) || schedules.length === 0) {
          throw new Error("schedules array required")
        }
        const tableName = await getUserTableName(employee_id)

        const isFromManager = schedules[0]?.status === "manager"
        const traiteValue = isFromManager ? "manager" : "admin"

        for (const sched of schedules) {
          const { date, start_time, end_time, shift_type, job_position, is_working, location_id, day, retard, status } =
            sched
          let validLocationId = null
          const finalShiftType = shift_type === "Repos" || shift_type === "0" ? "Repos" : shift_type
          if (location_id && location_id !== 0 && finalShiftType !== "Repos") {
            const locationCheck = await pool.query("SELECT id FROM locations WHERE id = $1", [location_id])
            if (locationCheck.rows.length > 0) validLocationId = location_id
          }
          try {
            await pool.query(
              `INSERT INTO "${tableName}" (employee_id, date, start_time, end_time, shift_type, job_position, is_working, location_id, day, retard, status, traite)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
               ON CONFLICT (date) DO UPDATE SET start_time = $3, end_time = $4, shift_type = $5, job_position = $6, is_working = $7, location_id = $8, day = $9, retard = $10, status = $11, traite = $12`,
              [
                employee_id,
                date,
                start_time,
                end_time,
                finalShiftType,
                job_position,
                is_working,
                validLocationId,
                day,
                retard,
                status,
                traiteValue,
              ],
            )
          } catch (error) {
            console.error("Error saving to per-user table:", error)
          }
        }

        // Clear existing template for this employee
        await pool.query(`DELETE FROM work_schedules WHERE employee_id = $1`, [employee_id])

        // Create 7 template days using the weekly pattern from the schedules
        const weeklyPattern = {}
        const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

        // Extract weekly pattern from the provided schedules
        for (const sched of schedules) {
          const schedDate = new Date(sched.date)
          const dayOfWeek = schedDate.getDay() // 0=Sunday, 1=Monday, etc.
          const dayKey = daysOfWeek[(dayOfWeek + 6) % 7] // Convert to Monday=0 format

          if (!weeklyPattern[dayKey]) {
            weeklyPattern[dayKey] = {
              shift_type: sched.shift_type === "Repos" || sched.shift_type === "0" ? "Repos" : sched.shift_type,
              start_time: sched.start_time,
              end_time: sched.end_time,
              job_position: sched.job_position,
              is_working: sched.is_working,
              location_id: sched.shift_type === "Repos" || sched.location_id === "0" ? null : sched.location_id,
            }
          }
        }

        // Insert 7 template days using placeholder dates (2024-01-01 = Monday)
        const baseDate = new Date("2024-01-01") // This is a Monday
        for (let i = 0; i < 7; i++) {
          const templateDate = new Date(baseDate)
          templateDate.setDate(baseDate.getDate() + i)
          const dayKey = daysOfWeek[i]
          const dayName = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i]

          const pattern = weeklyPattern[dayKey] || {
            shift_type: "Repos",
            start_time: null,
            end_time: null,
            job_position: "",
            is_working: false,
            location_id: null,
          }

          try {
            const workScheduleStatus = isFromManager ? "manager" : "active"
            await pool.query(
              `INSERT INTO work_schedules (employee_id, date, start_time, end_time, shift_type, job_position, is_working, location_id, day, retard, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [
                employee_id,
                templateDate.toISOString().slice(0, 10),
                pattern.start_time,
                pattern.end_time,
                pattern.shift_type,
                pattern.job_position,
                pattern.is_working,
                pattern.location_id,
                dayName,
                null,
                workScheduleStatus,
              ],
            )
          } catch (error) {
            console.error("Error saving template day to work_schedules:", error)
          }
        }

        return true
      } catch (error) {
        console.error("Error in createUserWorkSchedule:", error)
        throw new Error("Failed to create user work schedule")
      }
    },
    // Modified createWorkSchedule to use user tables
    createWorkSchedule: async (_: any, args: any) => {
      try {
        return await resolvers.Mutation.createUserWorkSchedule(_, {
          ...args,
          day: new Date(args.date).toLocaleDateString("en-US", { weekday: "long" }),
          retard: null,
          status: "active",
        })
      } catch (error) {
        console.error("Error creating work schedule:", error)
        throw new Error("Failed to create work schedule")
      }
    },
    createManagerWorkSchedule: async (_: any, { employee_id, schedules }: any) => {
      try {
        const tableName = await getUserTableName(employee_id)
        const results = []

        for (const schedule of schedules) {
          const { date, start_time, end_time, shift_type, job_position, is_working, location_id, day, retard, status } =
            schedule

          const finalStartTime = is_working ? start_time : "00:00:00"
          const finalEndTime = is_working ? end_time : "00:00:00"

          const result = await pool.query(
            `INSERT INTO "${tableName}"
             (employee_id, shift_type, job_position, start_time, end_time, date, is_working, location_id, day, retard, status, traite)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (date) DO UPDATE SET
               shift_type = EXCLUDED.shift_type,
               job_position = EXCLUDED.job_position,
               start_time = EXCLUDED.start_time,
               end_time = EXCLUDED.end_time,
               is_working = EXCLUDED.is_working,
               location_id = EXCLUDED.location_id,
               day = EXCLUDED.day,
               retard = EXCLUDED.retard,
               status = EXCLUDED.status,
               traite = EXCLUDED.traite
             RETURNING *`,
            [
              employee_id,
              shift_type,
              job_position,
              finalStartTime,
              finalEndTime,
              date,
              is_working,
              location_id,
              day,
              retard,
              "manager",
              "manager",
            ],
          )
          results.push(result.rows[0])
        }

        return results
      } catch (error) {
        console.error("Error creating manager work schedule:", error)
        throw new Error("Failed to create manager work schedule")
      }
    },

    sendApprovalRequest: async (_: any, args: any) => {
      try {
        const { type, reference_id, manager_id, employee_id, data, month } = args

        const finalReferenceId = reference_id || Math.floor(Date.now() / 1000) // Unix timestamp as integer
        const validType = type === "planning_approval" ? "schedule_change" : type

        await pool.query(
          "INSERT INTO admin_approvals (type, reference_id, manager_id, data, status) VALUES ($1, $2, $3, $4, $5)",
          [validType, finalReferenceId, manager_id, data, "pending"],
        )

        const notificationMessage = `Manager has proposed planning for employee ${employee_id} for month ${month}`
        await pool.query(
          `INSERT INTO notifications (user_id, role, title, message, type, reference_id, seen, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [1, "admin", "Planning Approval Request", notificationMessage, "planning_approval", finalReferenceId, false],
        )

        return true
      } catch (error) {
        console.error("Error sending approval request:", error)
        throw new Error("Failed to send approval request")
      }
    },

    approveManagerSchedule: async (_: any, { approval_id }: any) => {
      try {
        const approvalRes = await pool.query("SELECT * FROM admin_approvals WHERE id = $1", [approval_id])
        if (!approvalRes.rows.length) return false
        const { reference_id, data } = approvalRes.rows[0]
        const scheduleRes = await pool.query("SELECT * FROM manager_work_schedules WHERE id = $1", [reference_id])
        if (!scheduleRes.rows.length) return false

        const s = scheduleRes.rows[0]
        await pool.query(
          "INSERT INTO work_schedules (employee_id, shift_type, job_position, start_time, end_time, date, is_working) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [s.employee_id, s.shift_type, s.job_position, s.start_time, s.end_time, s.date, s.is_working],
        )
        await pool.query("UPDATE admin_approvals SET status = 'approved', reviewed_at = NOW() WHERE id = $1", [
          approval_id,
        ])
        await pool.query("DELETE FROM manager_work_schedules WHERE id = $1", [reference_id])

        // Notify employee and their manager
        const empUserRes = await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [s.employee_id])
        const empUser = empUserRes.rows[0]
        const empRes = await pool.query("SELECT location_id FROM employees WHERE id = $1", [s.employee_id])
        const location_id = empRes.rows[0]?.location_id
        const mgrEmpRes = await pool.query(
          "SELECT id FROM employees WHERE location_id = $1 AND job_title ILIKE '%manager%' LIMIT 1",
          [location_id],
        )
        const mgrEmp = mgrEmpRes.rows[0]
        const mgrUserRes = mgrEmp
          ? await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [mgrEmp.id])
          : { rows: [] as any[] }
        const mgrUser = mgrUserRes.rows[0]

        const schedule =
          typeof data === "string"
            ? (() => {
                try {
                  return JSON.parse(data)
                } catch {
                  return s
                }
              })()
            : s
        const title = "📅 Planning approuvé"
        const message = `Votre planning du ${schedule?.date ?? s.date} a été mis à jour.`
        if (empUser)
          await createNotification({
            user_id: empUser.id,
            role: "employee",
            title,
            message,
            type: "schedule_change",
            reference_id: approval_id,
          })
        if (mgrUser)
          await createNotification({
            user_id: mgrUser.id,
            role: "manager",
            title: "Planning employé mis à jour",
            message: "Planning d'un employé mis à jour.",
            type: "schedule_change",
            reference_id: approval_id,
          })

        return true
      } catch (error) {
        console.error("Error approving manager schedule:", error)
        return false
      }
    },
    rejectManagerSchedule: async (_: any, { approval_id }: any) => {
      try {
        await pool.query("UPDATE admin_approvals SET status = 'rejected', reviewed_at = NOW() WHERE id = $1", [
          approval_id,
        ])
        return true
      } catch (error) {
        console.error("Error rejecting manager schedule:", error)
        return false
      }
    },
    approveScheduleChange: async (_: any, { approval_id }: { approval_id: string }) => {
      try {
        const approvalRes = await pool.query("SELECT * FROM admin_approvals WHERE id = $1 AND status = 'pending'", [
          approval_id,
        ])
        if (!approvalRes.rows.length) return false
        const approval = approvalRes.rows[0]

        let schedule: any
        try {
          schedule = JSON.parse(approval.data)
        } catch {
          return false
        }

        await pool.query(
          "UPDATE work_schedules SET status = 'confirmed' WHERE employee_id = $1 AND status = 'manager'",
          [schedule.employee_id],
        )

        await pool.query("UPDATE admin_approvals SET status = 'noactive', traite = 'oui' WHERE id = $1", [approval_id])

        // Notify employee and their manager
        const empUserRes = await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [
          schedule.employee_id,
        ])
        const empUser = empUserRes.rows[0]
        const empRes = await pool.query("SELECT location_id FROM employees WHERE id = $1", [schedule.employee_id])
        const location_id = empRes.rows[0]?.location_id
        const mgrEmpRes = await pool.query(
          "SELECT id FROM employees WHERE location_id = $1 AND job_title ILIKE '%manager%' LIMIT 1",
          [location_id],
        )
        const mgrEmp = mgrEmpRes.rows[0]
        const mgrUserRes = mgrEmp
          ? await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [mgrEmp.id])
          : { rows: [] as any[] }
        const mgrUser = mgrUserRes.rows[0]

        const title = "📅 Planning mis à jour"
        const message = `Votre planning du ${schedule.date} a été approuvé.`
        if (empUser)
          await createNotification({
            user_id: empUser.id,
            role: "employee",
            title,
            message,
            type: "schedule_change",
            reference_id: approval_id,
          })
        if (mgrUser)
          await createNotification({
            user_id: mgrUser.id,
            role: "manager",
            title: "Planning employé approuvé",
            message: `Changement du ${schedule.date} approuvé.`,
            type: "schedule_change",
            reference_id: approval_id,
          })

        return true
      } catch (error) {
        console.error("Error approving schedule change:", error)
        return false
      }
    },
    rejectScheduleChange: async (_: any, { approval_id, comment }: { approval_id: string; comment?: string }) => {
      try {
        const approvalRes = await pool.query("SELECT * FROM admin_approvals WHERE id = $1 AND status = 'pending'", [
          approval_id,
        ])
        if (!approvalRes.rows.length) return false
        const approval = approvalRes.rows[0]
        await pool.query(
          "UPDATE admin_approvals SET status = 'rejected', reviewed_at = NOW(), admin_comment = $2 WHERE id = $1",
          [approval_id, comment || null],
        )

        // Inform employee and manager (parsed data has employee_id)
        let schedule: any
        try {
          schedule = JSON.parse(approval.data)
        } catch {
          schedule = null
        }
        if (schedule?.employee_id) {
          const empUserRes = await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [
            schedule.employee_id,
          ])
          const empUser = empUserRes.rows[0]
          const empRes = await pool.query("SELECT location_id FROM employees WHERE id = $1", [schedule.employee_id])
          const location_id = empRes.rows[0]?.location_id
          const mgrEmpRes = await pool.query(
            "SELECT id FROM employees WHERE location_id = $1 AND job_title ILIKE '%manager%' LIMIT 1",
            [location_id],
          )
          const mgrEmp = mgrEmpRes.rows[0]
          const mgrUserRes = mgrEmp
            ? await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [mgrEmp.id])
            : { rows: [] as any[] }
          const mgrUser = mgrUserRes.rows[0]

          const title = "❌ Changement de planning rejeté"
          const message = comment ? `Raison: ${comment}` : "Veuillez contacter votre manager."
          if (empUser)
            await createNotification({
              user_id: empUser.id,
              role: "employee",
              title,
              message,
              type: "schedule_change",
              reference_id: approval_id,
            })
          if (mgrUser)
            await createNotification({
              user_id: mgrUser.id,
              role: "manager",
              title: "Rejet de planning",
              message,
              type: "schedule_change",
              reference_id: approval_id,
            })
        }

        return true
      } catch (error) {
        console.error("Error rejecting schedule change:", error)
        return false
      }
    },
    login: async (_: any, { username, password }: { username: string; password: string }) => {
      try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1 AND password = $2", [
          username,
          password,
        ])
        const user = result.rows[0]
        if (!user) return null

        let location_id = null
        if (user.employee_id) {
          const empRes = await pool.query("SELECT location_id FROM employees WHERE id = $1", [user.employee_id])
          if (empRes.rows.length > 0) {
            location_id = empRes.rows[0].location_id
          }
        }

        return { ...user, location_id: location_id || user.location_id || null }
      } catch (error) {
        console.error("Error during login:", error)
        throw new Error("Login failed")
      }
    },
    createUser: async (
      _: any,
      {
        username,
        password,
        role,
        employee_id,
      }: { username: string; password: string; role: string; employee_id?: string },
    ) => {
      try {
        const result = await pool.query(
          "INSERT INTO users (username, password, role, employee_id) VALUES ($1, $2, $3, $4) RETURNING *",
          [username, password, role, employee_id],
        )
        return result.rows[0]
      } catch (error) {
        console.error("Error creating user:", error)
        throw new Error("Failed to create user")
      }
    },
    updateEmployee: async (_: any, { id, ...updates }: any) => {
      try {
        const beforeRes = await pool.query("SELECT * FROM employees WHERE id = $1", [id])
        if (beforeRes.rows.length === 0) throw new Error("Employee not found")
        const before = beforeRes.rows[0]

        if (updates.salaire !== undefined) {
          updates.price_j = Math.round((updates.salaire / 30) * 100) / 100
        }

        const fields = Object.keys(updates).filter((key) => updates[key] !== undefined)
        const values = fields.map((key) => updates[key])
        if (fields.length === 0) throw new Error("No fields to update")

        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(", ")
        const query = `UPDATE employees SET ${setClause} WHERE id = $1 RETURNING *`

        const result = await pool.query(query, [id, ...values])
        if (result.rows.length === 0) throw new Error("Employee not found after update")
        const employee = result.rows[0]

        const actuallyChanged = fields.filter((f) => String(before[f] ?? "") !== String(employee[f] ?? ""))

        const changes: string[] = []
        for (const field of actuallyChanged) {
          switch (field) {
            case "salaire":
              changes.push(`Salaire: ${arrow(fmtMoney(before.salaire), fmtMoney(employee.salaire))}`)
              break
            case "prime":
              changes.push(`Prime: ${arrow(fmtMoney(before.prime), fmtMoney(employee.prime))}`)
              break
            case "avance":
              changes.push(`Avance: ${arrow(fmtMoney(before.avance), fmtMoney(employee.avance))}`)
              break
            case "infractions":
              changes.push(`Infractions: ${arrow(fmtInt(before.infractions), fmtInt(employee.infractions))}`)
              break
            case "absence":
              changes.push(`Absences: ${arrow(fmtInt(before.absence), fmtInt(employee.absence))}`)
              break
            case "retard":
              changes.push(`Retards: ${arrow(fmtInt(before.retard), fmtInt(employee.retard))}`)
              break
            case "tenu_de_travail":
              changes.push(
                `Tenue de travail: ${arrow(fmtInt(before.tenu_de_travail), fmtInt(employee.tenu_de_travail))}`,
              )
              break
            case "status":
              changes.push(`Statut: ${arrow(String(before.status ?? "—"), String(employee.status ?? "—"))}`)
              break
            case "job_title":
              changes.push(`Poste: ${arrow(String(before.job_title ?? "—"), String(employee.job_title ?? "—"))}`)
              break
            case "location_id": {
              const { oldName, newName } = await getLocationNames(before.location_id, employee.location_id)
              changes.push(`Restaurant: ${arrow(oldName, newName)}`)
              break
            }
            case "price_j":
              changes.push(`Prix/jour: ${arrow(fmtMoney(before.price_j), fmtMoney(employee.price_j))}`)
              break
            default:
              changes.push(`${field}: ${arrow(String(before[field] ?? "—"), String(employee[field] ?? "—"))}`)
          }
        }

        if (changes.length > 0) {
          const summary = changes.join(" • ")
          await logRecentActivity({
            title: "Employé modifié",
            description: `${employee.prenom} ${employee.nom} (${employee.email}) — ${summary}`,
            type: "employee",
            urgent: false,
          })
        }

        return {
          ...employee,
          profile: {
            first_name: employee.prenom,
            last_name: employee.nom,
            phone: employee.telephone,
          },
        }
      } catch (error) {
        console.error("Error updating employee:", error)
        throw new Error("Failed to update employee")
      }
    },
    // Enhanced update: update both per-user table and work_schedules for current week
    updateWorkSchedule: async (_: any, { id, employee_id, ...updates }: any) => {
      try {
        // 1. Update per-user table (find by date)
        if (!employee_id || !updates.date) throw new Error("employee_id and date required")
        const tableName = await getUserTableName(employee_id)
        const fields = Object.keys(updates).filter((key) => updates[key] !== undefined)
        const values = fields.map((key) => updates[key])
        if (fields.length === 0) throw new Error("No fields to update")
        const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(", ")
        await pool.query(`UPDATE "${tableName}" SET ${setClause} WHERE date = $1`, [updates.date, ...values])
        // 2. If date is in current week, update work_schedules
        const now = new Date()
        const weekStart = new Date(now)
        weekStart.setDate(now.getDay() === 0 ? now.getDate() - 6 : now.getDate() - (now.getDay() - 1)) // Adjust for Sunday being day 0
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        const schedDate = new Date(updates.date)
        if (schedDate >= weekStart && schedDate <= weekEnd) {
          const setClauseWS = fields.map((field, idx) => `${field} = $${idx + 2}`).join(", ")
          await pool.query(`UPDATE work_schedules SET ${setClauseWS} WHERE employee_id = $1 AND date = $2`, [
            employee_id,
            updates.date,
            ...values,
          ])
        }
        return true
      } catch (error) {
        console.error("Error updating work schedule:", error)
        throw new Error("Failed to update work schedule")
      }
    },
    createLeaveRequest: async (_: any, args: any) => {
      try {
        const { employee_id, type, start_date, end_date, reason } = args
        const startDate = new Date(start_date)
        const endDate = new Date(end_date)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        const days_count = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        const result = await pool.query(
          "INSERT INTO leave_requests (employee_id, type, start_date, end_date, days_count, reason, status) VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *",
          [employee_id, type, start_date, end_date, days_count, reason],
        )
        return result.rows[0]
      } catch (error) {
        console.error("Error creating leave request:", error)
        throw new Error("Failed to create leave request")
      }
    },
    approveLeaveRequest: async (_: any, { id, status, comment }: { id: string; status: string; comment?: string }) => {
      try {
        const result = await pool.query(
          "UPDATE leave_requests SET status = $1, admin_comment = $2, approved_at = NOW() WHERE id = $3 RETURNING *",
          [status, comment || null, id],
        )
        const lr = result.rows[0]

        // Notify employee and manager (location manager)
        if (lr) {
          const empUserRes = await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [lr.employee_id])
          const empUser = empUserRes.rows[0]
          const empRes = await pool.query("SELECT location_id FROM employees WHERE id = $1", [lr.employee_id])
          const location_id = empRes.rows[0]?.location_id
          const mgrEmpRes = await pool.query(
            "SELECT id FROM employees WHERE location_id = $1 AND job_title ILIKE '%manager%' LIMIT 1",
            [location_id],
          )
          const mgrEmp = mgrEmpRes.rows[0]
          const mgrUserRes = mgrEmp
            ? await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [mgrEmp.id])
            : { rows: [] as any[] }
          const mgrUser = mgrUserRes.rows[0]

          const accepted = status === "approved"
          const title = accepted ? "✅ Demande de congé acceptée" : "❌ Demande de congé refusée"
          const message = comment ? `Commentaire: ${comment}` : undefined
          if (empUser)
            await createNotification({
              user_id: empUser.id,
              role: "employee",
              title,
              message,
              type: "leave_request",
              reference_id: id,
            })
          if (mgrUser)
            await createNotification({
              user_id: mgrUser.id,
              role: "manager",
              title: accepted ? "Congé employé accepté" : "Congé employé refusé",
              message,
              type: "leave_request",
              reference_id: id,
            })
        }

        return lr
      } catch (error) {
        console.error("Error approving leave request:", error)
        throw new Error("Failed to approve leave request")
      }
    },
    createContract: async (_: any, args: any) => {
      try {
        const { employee_id, contract_type, start_date, end_date, salary, tenu_count, documents } = args
        const result = await pool.query(
          "INSERT INTO contracts (employee_id, contract_type, start_date, end_date, salary, tenu_count, documents, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *",
          [employee_id, contract_type, start_date, end_date, salary, tenu_count || 0, documents || []],
        )
        return result.rows[0]
      } catch (error) {
        console.error("Error creating contract:", error)
        throw new Error("Failed to create contract")
      }
    },
    createEmployee: async (_: any, args: any) => {
      try {
        const { username, email, nom, prenom, telephone, job_title, salaire, role, location_id } = args

        const price_j = salaire ? Math.round((salaire / 30) * 100) / 100 : 0

        const employeeResult = await pool.query(
          "INSERT INTO employees (nom, prenom, email, telephone, job_title, salaire, location_id, status, price_j) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8) RETURNING *",
          [nom, prenom, email, telephone, job_title, salaire || 0, location_id, price_j],
        )
        const employee = employeeResult.rows[0]

        await pool.query("INSERT INTO users (username, password, role, employee_id) VALUES ($1, $2, $3, $4)", [
          username,
          "password123",
          role || "employee",
          employee.id,
        ])

        await logRecentActivity({
          title: "Nouvel employé ajouté",
          description: `${prenom} ${nom} (${email})`,
          type: "employee",
          urgent: false,
        })

        return {
          ...employee,
          profile: {
            first_name: employee.prenom,
            last_name: employee.nom,
            phone: employee.telephone,
          },
        }
      } catch (error) {
        console.error("Error creating employee:", error)
        throw new Error("Failed to create employee")
      }
    },
    deleteEmployee: async (_: any, { id }: { id: string }) => {
      try {
        const empRes = await pool.query("SELECT nom, prenom, email FROM employees WHERE id = $1", [id])
        const emp = empRes.rows[0]
        await pool.query("DELETE FROM users WHERE employee_id = $1", [id])
        const result = await pool.query("DELETE FROM employees WHERE id = $1", [id])
        if (result.rowCount > 0 && emp) {
          await logRecentActivity({
            title: "Employé supprimé",
            description: `${emp.prenom} ${emp.nom} (${emp.email})`,
            type: "employee",
            urgent: false,
          })
        }
        return result.rowCount > 0
      } catch (error) {
        console.error("Error deleting employee:", error)
        throw new Error("Failed to delete employee")
      }
    },
    clockIn: async (_: any, { employeeId, locationId }: { employeeId: string; locationId: string }) => {
      try {
        // Get the user table name for this employee
        const tableName = await getUserTableName(employeeId)

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0]

        // Get today's work schedule to check for tardiness
        const scheduleResult = await pool.query(`SELECT start_time, retard FROM "${tableName}" WHERE date = $1`, [
          today,
        ])

        let retardAmount = 0
        let isLate = false

        if (scheduleResult.rows.length > 0) {
          const schedule = scheduleResult.rows[0]
          if (schedule.start_time) {
            const now = new Date()
            const scheduledStart = new Date(`${today}T${schedule.start_time}`)
            const diffMinutes = (now.getTime() - scheduledStart.getTime()) / (1000 * 60)

            // Check if more than 15 minutes late
            if (diffMinutes > 15) {
              isLate = true
              retardAmount = 20 // 20 DT penalty for being late

              // Insert retard record
              const retardDescription = `retard dans le pointeuse le date of today ${today.split("-").reverse().join("_")} : ${now.toTimeString().split(" ")[0]}`
              await pool.query(
                "INSERT INTO public.retards (name, description, employee_id, price, dat) VALUES ($1, $2, $3, $4, $5)",
                ["retard auto", retardDescription, employeeId, retardAmount, now],
              )
            }
          }
        }

        // Insert time entry
        const result = await pool.query(
          "INSERT INTO time_entries (employee_id, location_id, clock_in, date, status) VALUES ($1, $2, NOW(), CURRENT_DATE, 'active') RETURNING *",
          [employeeId, locationId],
        )

        // Update employee status to active
        await pool.query("UPDATE public.employees SET status='active' WHERE id = $1", [employeeId])

        // Update work schedule record
        const updateQuery = `UPDATE "${tableName}" SET is_working = true, status = 'en service', traite = 'oui'${isLate ? ", retard = $3" : ""} WHERE date = $1 AND employee_id = $2`
        const updateParams = isLate ? [today, employeeId, retardAmount] : [today, employeeId]
        await pool.query(updateQuery, updateParams)

        return result.rows[0]
      } catch (error) {
        console.error("Error clocking in:", error)
        throw new Error("Failed to clock in")
      }
    },
    clockOut: async (_: any, { timeEntryId }: { timeEntryId: string }) => {
      try {
        // Get the time entry to find employee_id
        const timeEntryResult = await pool.query("SELECT employee_id FROM time_entries WHERE id = $1", [timeEntryId])

        if (timeEntryResult.rows.length === 0) {
          throw new Error("Time entry not found")
        }

        const employeeId = timeEntryResult.rows[0].employee_id
        const tableName = await getUserTableName(employeeId)
        const today = new Date().toISOString().split("T")[0]

        // Update time entry
        const result = await pool.query(
          "UPDATE time_entries SET clock_out = NOW(), status = 'completed', total_hours = EXTRACT(EPOCH FROM (NOW() - clock_in))/3600 WHERE id = $1 RETURNING *",
          [timeEntryId],
        )

        // Update employee status to inactive
        await pool.query("UPDATE public.employees SET status='inactive' WHERE id = $1", [employeeId])

        // Update work schedule record
        await pool.query(
          `UPDATE "${tableName}" SET is_worked = true, status = 'fin service', traite = 'oui' WHERE date = $1 AND employee_id = $2`,
          [today, employeeId],
        )

        return result.rows[0]
      } catch (error) {
        console.error("Error clocking out:", error)
        throw new Error("Failed to clock out")
      }
    },
    paySalary: async (_: any, { employee_id, period }: { employee_id: string; period: string }) => {
      try {
        const { start, end } = firstAndLastDateOfMonth(period)

        // 1) Compute days worked from per-user table using is_worked and shift_type multipliers
        let days_worked = 0
        try {
          const tableName = await getUserTableName(employee_id)
          const workedRes = await pool.query(
            `SELECT shift_type, COUNT(*) AS cnt
             FROM "${tableName}"
             WHERE employee_id = $1
               AND is_worked = true
               AND date BETWEEN $2 AND $3
             GROUP BY shift_type`,
            [employee_id, start, end],
          )
          for (const row of workedRes.rows) {
            const count = Number(row.cnt) || 0
            if (row.shift_type === "Doublage") days_worked += count * 2
            else if (row.shift_type === "Matin" || row.shift_type === "Soirée") days_worked += count * 1
          }
        } catch (err) {
          // Fallback: use shared work_schedules if per-user table is unavailable
          const workSchedulesRes = await pool.query(
            `SELECT shift_type, COUNT(*) as cnt
             FROM work_schedules
             WHERE employee_id = $1 AND is_working = true AND date BETWEEN $2 AND $3
             GROUP BY shift_type`,
            [employee_id, start, end],
          )
          for (const row of workSchedulesRes.rows) {
            const count = Number(row.cnt) || 0
            if (row.shift_type === "Doublage") days_worked += count * 2
            else if (row.shift_type === "Matin" || row.shift_type === "Soirée") days_worked += count * 1
          }
        }

        // 2) Get base finance fields
        const employeeRes = await pool.query(
          `SELECT price_j, prime, avance, nom, prenom, email FROM employees WHERE id = $1`,
          [employee_id],
        )
        const employee = employeeRes.rows[0] || {}
        const price_j = Number(employee.price_j ?? 0)
        const prime = Number(employee.prime ?? 0)
        const avance = Number(employee.avance ?? 0)

        // 3) Sum disciplinary deductions for the month from individual tables (sum of price)
        // Use created_date for monthly filter; fallback to 0 if none
        const likeRef = `${period}%`
        const sumPrices = async (table: string) => {
          const r = await pool.query(
            `SELECT COALESCE(SUM(price), 0) AS total
             FROM ${table}
             WHERE employee_id = $1
               AND dat::text LIKE $2`,
            [employee_id, likeRef],
          )
          return Number(r.rows[0]?.total ?? 0)
        }
        const absPrice = await sumPrices("absences")
        const infPrice = await sumPrices("infractions")
        const retPrice = await sumPrices("retards")
        const totalDeductions = absPrice + infPrice + retPrice
        // 4) Compute amount: prime + (price_j * days_worked) - avance - deductions
        const grossAmount = prime + price_j * days_worked
        const amount = Math.max(0, Math.round((grossAmount - avance - totalDeductions) * 100) / 100)

        // 5) Upsert payroll record (store days in hours_worked column for compatibility)
        const upsert = await pool.query(
          `INSERT INTO payroll_payments (employee_id, period, paid, paid_at, amount, hours_worked)
           VALUES ($1, $2, true, NOW(), $3, $4)
           ON CONFLICT (employee_id, period)
           DO UPDATE SET paid = EXCLUDED.paid,
                         paid_at = EXCLUDED.paid_at,
                         amount = EXCLUDED.amount,
                         hours_worked = EXCLUDED.hours_worked
           RETURNING id, employee_id, period, paid, paid_at, amount, hours_worked`,
          [employee_id, period, amount, days_worked],
        )

        // Optionally reset prime/avance after payment
        await pool.query(`UPDATE employees SET prime = NULL, avance = NULL WHERE id = $1`, [employee_id])

        try {
          const e = employee
          await logRecentActivity({
            title: "Salaire payé",
            description: `${e?.prenom ?? ""} ${e?.nom ?? ""} — Période ${period} • ${days_worked} jours × ${fmtMoney(price_j)} + prime ${fmtMoney(prime)} - avance ${fmtMoney(avance)} - déductions ${Math.round(totalDeductions * 100) / 100} = ${fmtMoney(amount)}`,
            type: "finance",
            urgent: false,
          })
        } catch (err) {
          console.error("Failed to log payment activity:", err)
        }

        return upsert.rows[0]
      } catch (e) {
        console.error("Error in paySalary:", e)
        throw new Error("Failed to mark salary as paid")
      }
    },
    markNotificationSeen: async (_: any, { id }: { id: string }) => {
      try {
        await pool.query("UPDATE notifications SET seen = true WHERE id = $1", [id])
        return true
      } catch (e) {
        console.error("Failed to mark notification seen:", e)
        return false
      }
    },
    markAllNotificationsSeen: async (_: any, { user_id }: { user_id: string }) => {
      try {
        await pool.query("UPDATE notifications SET seen = true WHERE user_id = $1", [user_id])
        return true
      } catch (e) {
        console.error("Failed to mark all notifications seen:", e)
        return false
      }
    },
    notifyPlanningForEmployee: async (_: any, { employee_id, month }: { employee_id: string; month: string }) => {
      try {
        // find user_id for employee
        const userRes = await pool.query("SELECT id FROM users WHERE employee_id = $1 LIMIT 1", [employee_id])
        const user = userRes.rows[0]
        if (!user) return false
        await createNotification({
          user_id: user.id,
          role: "employee",
          title: "📅 Planning mis à jour",
          message: `Votre planning de ${month} est disponible.`,
          type: "planning",
          reference_id: month,
        })
        return true
      } catch (e) {
        console.error("notifyPlanningForEmployee failed:", e)
        return false
      }
    },
    updateEmployeeProfile: async (_: any, { id, nom, prenom, email, telephone, job_title, location_id }: any) => {
      try {
        const beforeRes = await pool.query("SELECT * FROM employees WHERE id = $1", [id])
        if (beforeRes.rows.length === 0) throw new Error("Employee not found")

        const updateFields = []
        const updateValues = []
        let paramIndex = 2

        if (nom !== undefined) {
          updateFields.push(`nom = $${paramIndex}`)
          updateValues.push(nom)
          paramIndex++
        }
        if (prenom !== undefined) {
          updateFields.push(`prenom = $${paramIndex}`)
          updateValues.push(prenom)
          paramIndex++
        }
        if (email !== undefined) {
          updateFields.push(`email = $${paramIndex}`)
          updateValues.push(email)
          paramIndex++
        }
        if (telephone !== undefined) {
          updateFields.push(`telephone = $${paramIndex}`)
          updateValues.push(telephone)
          paramIndex++
        }
        if (job_title !== undefined) {
          updateFields.push(`job_title = $${paramIndex}`)
          updateValues.push(job_title)
          paramIndex++
        }
        if (location_id !== undefined) {
          updateFields.push(`location_id = $${paramIndex}`)
          updateValues.push(location_id)
          paramIndex++
        }

        if (updateFields.length === 0) {
          return beforeRes.rows[0]
        }

        const query = `UPDATE employees SET ${updateFields.join(", ")} WHERE id = $1 RETURNING *`
        const result = await pool.query(query, [id, ...updateValues])

        if (result.rows.length === 0) throw new Error("Employee not found after update")

        const employee = result.rows[0]

        await logRecentActivity({
          title: "Profil mis à jour",
          description: `${employee.prenom} ${employee.nom} a mis à jour son profil`,
          type: "employee",
          urgent: false,
        })

        return employee
      } catch (error) {
        console.error("Error updating employee profile:", error)
        throw new Error("Failed to update employee profile")
      }
    },
    updateUserPassword: async (_: any, { employee_id, currentPassword, newPassword }: any) => {
      try {
        // First verify current password
        const userRes = await pool.query("SELECT * FROM users WHERE employee_id = $1", [employee_id])
        if (userRes.rows.length === 0) throw new Error("User not found")

        const user = userRes.rows[0]
        if (user.password !== currentPassword) {
          throw new Error("Current password is incorrect")
        }

        // Update password
        const result = await pool.query(
          "UPDATE users SET password = $1 WHERE employee_id = $2 RETURNING id, username",
          [newPassword, employee_id],
        )

        if (result.rows.length === 0) throw new Error("Failed to update password")

        await logRecentActivity({
          title: "Mot de passe modifié",
          description: `L'utilisateur ${user.username} a changé son mot de passe`,
          type: "security",
          urgent: false,
        })

        return result.rows[0]
      } catch (error) {
        console.error("Error updating user password:", error)
        throw new Error("Failed to update password")
      }
    },
    updateUserInfo: async (_: any, { employee_id, username, hire_date }: any) => {
      try {
        const updates = []
        const values = []
        const paramIndex = 2

        // Update username in users table
        if (username !== undefined) {
          const userResult = await pool.query(
            "UPDATE users SET username = $1 WHERE employee_id = $2 RETURNING id, username",
            [username, employee_id],
          )
          if (userResult.rows.length === 0) throw new Error("User not found")
        }

        // Update hire date (created_at) in employees table
        if (hire_date !== undefined) {
          await pool.query("UPDATE employees SET created_at = $1 WHERE id = $2", [hire_date, employee_id])
        }

        // Get updated user and employee data
        const userRes = await pool.query("SELECT * FROM users WHERE employee_id = $1", [employee_id])
        const employeeRes = await pool.query("SELECT * FROM employees WHERE id = $1", [employee_id])

        if (userRes.rows.length === 0) throw new Error("User not found")

        const user = userRes.rows[0]
        const employee = employeeRes.rows[0]

        await logRecentActivity({
          title: "Informations utilisateur mises à jour",
          description: `${employee?.prenom} ${employee?.nom} - informations utilisateur modifiées`,
          type: "employee",
          urgent: false,
        })

        return {
          id: user.id,
          username: user.username,
          employee: employee,
        }
      } catch (error) {
        console.error("Error updating user info:", error)
        throw new Error("Failed to update user info")
      }
    },

    createInfraction: async (_: any, args: any) => {
      try {
        const { employee_id, name, description, price, dat } = args
        let formattedDate = dat
        if (dat) {
          if (/^\d+$/.test(String(dat))) {
            // Numeric timestamp
            const d = new Date(Number(dat))
            formattedDate = d.toISOString().slice(0, 10)
          } else {
            // Parse dd/MM/yyyy to yyyy-MM-dd for Postgres
            const parts = String(dat).split("/")
            if (parts.length === 3) {
              formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`
            }
          }
        } else {
          const now = new Date()
          formattedDate = now.toISOString().slice(0, 10)
        }

        const result = await pool.query(
          "INSERT INTO infractions (employee_id, name, description, price, dat) VALUES ($1, $2, $3, $4, $5) RETURNING *",
          [employee_id, name, description, price, formattedDate],
        )
        // Subtract price from employee's salary
        const userResult = await pool.query("SELECT id FROM users WHERE employee_id = $1", [employee_id])
        if (userResult.rows.length > 0) {
          await createNotification({
            user_id: userResult.rows[0].id,
            role: "employee",
            title: "Nouvelle infraction",
            message: `Une infraction \"${name}\" a été ajoutée à votre dossier. Montant: ${price} DT`,
            type: "infraction",
            reference_id: result.rows[0].id,
          })
        }
        return result.rows[0]
      } catch (error) {
        console.error("Error creating infraction:", error)
        throw new Error("Failed to create infraction")
      }
    },

    deleteInfraction: async (_: any, { id }: { id: number }) => {
      try {
        // Get price and employee_id before delete
        const res = await pool.query("SELECT price, employee_id FROM infractions WHERE id = $1", [id])
        if (!res.rows.length) throw new Error("Infraction not found")
        await pool.query("DELETE FROM infractions WHERE id = $1", [id])
        // Add price back to employee's salary
        return true
      } catch (error) {
        console.error("Error deleting infraction:", error)
        throw new Error("Failed to delete infraction")
      }
    },
    createAbsence: async (_: any, args: any) => {
      try {
        const { employee_id, name, description, price, dat } = args
        let formattedDate = dat
        //console.log("Received date:", dat)
        if (dat) {
          if (/^\d+$/.test(String(dat))) {
            // Numeric timestamp
            const d = new Date(Number(dat))
            formattedDate = d.toISOString().slice(0, 10)
          } else {
            // Parse dd/MM/yyyy to yyyy-MM-dd for Postgres
            const parts = String(dat).split("/")
            if (parts.length === 3) {
              formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`
            }
          }
        } else {
          const now = new Date()
          formattedDate = now.toISOString().slice(0, 10)
        }

        const result = await pool.query(
          "INSERT INTO absences (employee_id, name, description, price, dat) VALUES ($1, $2, $3, $4, $5) RETURNING *",
          [employee_id, name, description, price, formattedDate],
        )
        //console.log("saveddate", formattedDate)
        // Subtract price from employee's salary
        const userResult = await pool.query("SELECT id FROM users WHERE employee_id = $1", [employee_id])
        if (userResult.rows.length > 0) {
          await createNotification({
            user_id: userResult.rows[0].id,
            role: "employee",
            title: "Nouvelle absence",
            message: `Une absence \"${name}\" a été enregistrée. Montant: ${price} DT`,
            type: "absence",
            reference_id: result.rows[0].id,
          })
        }
        return result.rows[0]
      } catch (error) {
        console.error("Error creating absence:", error)
        throw new Error("Failed to create absence")
      }
    },

    deleteAbsence: async (_: any, { id }: { id: number }) => {
      try {
        const res = await pool.query("SELECT price, employee_id FROM absences WHERE id = $1", [id])
        if (!res.rows.length) throw new Error("Absence not found")
        await pool.query("DELETE FROM absences WHERE id = $1", [id])
        return true
      } catch (error) {
        console.error("Error deleting absence:", error)
        throw new Error("Failed to delete absence")
      }
    },
    createRetard: async (_: any, args: any) => {
      try {
        const { employee_id, name, description, price, dat } = args
        let formattedDate = dat
        if (dat) {
          if (/^\d+$/.test(String(dat))) {
            // Numeric timestamp
            const d = new Date(Number(dat))
            formattedDate = d.toISOString().slice(0, 10)
          } else {
            // Parse dd/MM/yyyy to yyyy-MM-dd for Postgres
            const parts = String(dat).split("/")
            if (parts.length === 3) {
              formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`
            }
          }
        } else {
          const now = new Date()
          formattedDate = now.toISOString().slice(0, 10)
        }

        const result = await pool.query(
          "INSERT INTO retards (employee_id, name, description, price, dat) VALUES ($1, $2, $3, $4, $5) RETURNING *",
          [employee_id, name, description, price, formattedDate],
        )
        const userResult = await pool.query("SELECT id FROM users WHERE employee_id = $1", [employee_id])
        if (userResult.rows.length > 0) {
          await createNotification({
            user_id: userResult.rows[0].id,
            role: "employee",
            title: "Nouveau retard",
            message: `Un retard \"${name}\" a été enregistré. Montant: ${price} DT`,
            type: "retard",
            reference_id: result.rows[0].id,
          })
        }
        return result.rows[0]
      } catch (error) {
        console.error("Error creating retard:", error)
        throw new Error("Failed to create retard")
      }
    },

    deleteRetard: async (_: any, { id }: { id: number }) => {
      try {
        const res = await pool.query("SELECT price, employee_id FROM retards WHERE id = $1", [id])
        if (!res.rows.length) throw new Error("Retard not found")
        await pool.query("DELETE FROM retards WHERE id = $1", [id])
        return true
      } catch (error) {
        console.error("Error deleting retard:", error)
        throw new Error("Failed to delete retard")
      }
    },
    createTenueTravail: async (_: any, args: any) => {
      try {
        const { employee_id, name, description, price } = args
        const result = await pool.query(
          "INSERT INTO tenues_de_travail (employee_id, name, description, price) VALUES ($1, $2, $3, $4) RETURNING *",
          [employee_id, name, description, price],
        )
        const userResult = await pool.query("SELECT id FROM users WHERE employee_id = $1", [employee_id])
        if (userResult.rows.length > 0) {
          await createNotification({
            user_id: userResult.rows[0].id,
            role: "employee",
            title: "Tenue de travail",
            message: `Une note sur la tenue de travail \"${name}\" a été ajoutée. Montant: ${price} DT`,
            type: "tenue_travail",
            reference_id: result.rows[0].id,
          })
        }
        return result.rows[0]
      } catch (error) {
        console.error("Error creating tenue de travail:", error)
        throw new Error("Failed to create tenue de travail")
      }
    },

    deleteTenueTravail: async (_: any, { id }: { id: number }) => {
      try {
        const res = await pool.query("SELECT price, employee_id FROM tenues_de_travail WHERE id = $1", [id])
        if (!res.rows.length) throw new Error("Tenue de travail not found")
        await pool.query("DELETE FROM tenues_de_travail WHERE id = $1", [id])
        return true
      } catch (error) {
        console.error("Error deleting tenue de travail:", error)
        throw new Error("Failed to delete tenue de travail")
      }
    },
    deleteWorkSchedule: async (_: any, { id }: { id: string }) => {
      try {
        const result = await pool.query("DELETE FROM work_schedules WHERE id = $1", [id])
        return result.rowCount > 0
      } catch (error) {
        console.error("Error deleting work schedule:", error)
        throw new Error("Failed to delete work schedule")
      }
    },
    deleteWorkSchedulesByEmployee: async (_: any, { employee_id }: { employee_id: string }) => {
      try {
        // Delete from work_schedules where employee_id = selected user and status = manager
        await pool.query("DELETE FROM work_schedules WHERE employee_id = $1 AND status = 'manager'", [employee_id])

        // Delete from admin_approvals where status = manager (source table cleanup)
        await pool.query("DELETE FROM admin_approvals WHERE status = 'manager'")

        return true
      } catch (error) {
        console.error("Error deleting work schedules:", error)
        return false
      }
    },
  },
  Employee: {
    user: async (parent: any) => {
      try {
        const res = await pool.query("SELECT * FROM users WHERE employee_id = $1 LIMIT 1", [parent.id])
        return res.rows[0] || null
      } catch (e) {
        console.error("Employee.user resolver failed:", e)
        return null
      }
    },
  },
  WorkSchedule: {
    location: async (parent: any) => {
      try {
        if (!parent.location_id) return null
        const res = await pool.query("SELECT * FROM locations WHERE id = $1", [parent.location_id])
        return res.rows[0] || null
      } catch (e) {
        console.error("WorkSchedule.location resolver failed:", e)
        return null
      }
    },
    employee: async (parent: any) => {
      try {
        const res = await pool.query("SELECT * FROM employees WHERE id = $1", [parent.employee_id])
        return res.rows[0] || null
      } catch (e) {
        console.error("WorkSchedule.employee resolver failed:", e)
        return null
      }
    },
  },
}

// Create server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  formatError: (err) => {
    console.error("GraphQL Error:", err)
    return { message: err.message, locations: err.locations, path: err.path }
  },
})

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => ({ req, res }),
})

export { handler as GET, handler as POST }
