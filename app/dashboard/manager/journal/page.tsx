"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, AlertTriangle, ChevronLeft, ChevronRight, X, Search, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useLazyQuery } from "@apollo/client"
import {
  GET_EMPLOYEES,
  GET_LOCATIONS,
  GET_ALL_USER_WORK_SCHEDULES, // New query for all per-user tables
  GET_WORK_SCHEDULES_RANGE,
  UPDATE_WORK_SCHEDULE,
  NOTIFY_PLANNING_FOR_EMPLOYEE,
  GET_WEEKLY_TEMPLATE_SCHEDULES,
  SEND_APPROVAL_REQUEST, // Added for sending approval to admin
  CREATE_USER_WORK_SCHEDULE, // Added for manager to use the same mutation as admin
  CREATE_NOTIFICATION, // Import CREATE_NOTIFICATION mutation
} from "@/lib/graphql-queries"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context" // Added for manager authentication

type Lang = "fr" | "ar"

type Dict = {
  pageTitle: string
  pageSubtitle: string
  weeklyTitle: string
  weeklySubtitle: string
  thEmployee: string
  filterByRestaurant: string
  allRestaurants: string
  selectEmployee: string
  chooseEmployee: string
  employeesTitle: string
  employeesSubtitle: string
  editorTitle: (first: string, last: string) => string
  editorSubtitle: string
  weekRoleLabel: string
  selectRole: string
  selectShift: string
  saveSchedule: string
  days: { key: string; label: string }[]
  shifts: { value: "Matin" | "Soirée" | "Doublage" | "Repos"; label: string }[]
  dash: string
  loading: string
  loadErrorTitle: string
  missingDataTitle: string
  missingDataDesc: string
  errTitle: string
  selectEmployeeErr: string
  saveOkTitle: string
  saveOkDesc: string
  saveErrTitle: string
  saveErrDesc: string
  monthlyPlan: string
  monthlyPlanSubtitle: (monthText: string) => string
  legendSimple: string
  legendDouble: string
  legendRest: string
  selectLocation: string
  selectShiftShort: string
  apply: string
  clear: string
  confirmPlan: string
  clearAll: string
  prevMonth: string
  nextMonth: string
  locationAbbrev: string
  notifPlanOk: string
  weeklyPlan: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    pageTitle: "Journal Manager", // Updated title for manager
    pageSubtitle: "Proposez les plannings de votre équipe à l'administrateur", // Updated subtitle for manager
    weeklyTitle: "Planning Hebdomadaire",
    weeklySubtitle: "Horaires de travail par employé et par jour",
    thEmployee: "Employé",
    filterByRestaurant: "Filtrer par Restaurant",
    allRestaurants: "Tous les restaurants",
    selectEmployee: "Sélectionner un Employé",
    chooseEmployee: "Choisir un employé",
    employeesTitle: "Employés",
    employeesSubtitle: "Cliquez sur un employé pour modifier son planning",
    editorTitle: (f, l) => `Planning de ${f} ${l}`,
    editorSubtitle: "Définissez les horaires de travail pour la semaine et le poste",
    weekRoleLabel: "Poste pour cette semaine",
    selectRole: "Sélectionner un poste",
    selectShift: "Sélectionner un créneau",
    saveSchedule: "Proposer le Planning", // Changed to "Propose" instead of "Save"
    days: [
      { key: "monday", label: "Lundi" },
      { key: "tuesday", label: "Mardi" },
      { key: "wednesday", label: "Mercredi" },
      { key: "thursday", label: "Jeudi" },
      { key: "friday", label: "Vendredi" },
      { key: "saturday", label: "Samedi" },
      { key: "sunday", label: "Dimanche" },
    ],
    shifts: [
      { value: "Matin", label: "Matin" }, // Removed hardcoded times from labels
      { value: "Soirée", label: "Soirée" },
      { value: "Doublage", label: "Doublage" },
      { value: "Repos", label: "Repos" },
    ],
    dash: "-",
    loading: "Chargement des données...",
    loadErrorTitle: "Erreur de chargement des données",
    missingDataTitle: "Erreur: Données manquantes du serveur",
    missingDataDesc: "Vérifiez la connexion à la base de données ou contactez l'administrateur.",
    errTitle: "Erreur",
    selectEmployeeErr: "Veuillez sélectionner un employé",
    saveOkTitle: "Planning proposé", // Changed to "proposed" instead of "saved"
    saveOkDesc: "Le planning a été envoyé à l'administrateur pour approbation", // Updated message
    saveErrTitle: "Erreur",
    saveErrDesc: "Impossible de proposer le planning",
    monthlyPlan: "Planifier le mois",
    monthlyPlanSubtitle: (m) => `Points: 1 = shift simple, 2 = doublage. Mois affiché: ${m}`,
    legendSimple: "Shift simple",
    legendDouble: "Doublage",
    legendRest: "Repos / Non travaillé",
    selectLocation: "Restaurant",
    selectShiftShort: "Shift",
    apply: "Appliquer",
    clear: "Effacer",
    confirmPlan: "Proposer le planning", // Changed to "Propose" instead of "Confirm"
    clearAll: "Vider le mois",
    prevMonth: "Mois précédent",
    nextMonth: "Mois suivant",
    locationAbbrev: "Rest.",
    notifPlanOk: "Planning du mois envoyé à l'administrateur pour approbation", // Updated message
    weeklyPlan: "Planning Hebdo",
  },
  ar: {
    pageTitle: "دفتر المدير", // Updated title for manager
    pageSubtitle: "اقترح جداول فريقك على المشرف", // Updated subtitle for manager
    weeklyTitle: "الجدول الأسبوعي",
    weeklySubtitle: "ساعات العمل لكل موظف ولكل يوم",
    thEmployee: "الموظف",
    filterByRestaurant: "تصفية حسب المطعم",
    allRestaurants: "جميع المطاعم",
    selectEmployee: "اختيار موظف",
    chooseEmployee: "اختر موظفًا",
    employeesTitle: "الموظفون",
    employeesSubtitle: "انقر على موظف لتعديل جدوله",
    editorTitle: (f, l) => `جدول ${f} ${l}`,
    editorSubtitle: "حدد ساعات العمل للأسبوع والمنصب",
    weekRoleLabel: "المنصب لهذا الأسبوع",
    selectRole: "اختر منصبًا",
    selectShift: "اختر فترة",
    saveSchedule: "اقتراح الجدول", // Changed to "Propose" instead of "Save"
    days: [
      { key: "monday", label: "الإثنين" },
      { key: "tuesday", label: "الثلاثاء" },
      { key: "wednesday", label: "الأربعاء" },
      { key: "thursday", label: "الخميس" },
      { key: "friday", label: "الجمعة" },
      { key: "saturday", label: "السبت" },
      { key: "sunday", label: "الأحد" },
    ],
    shifts: [
      { value: "Matin", label: "صباحي" }, // Removed hardcoded times from labels
      { value: "Soirée", label: "مسائي" },
      { value: "Doublage", label: "مزدوج" },
      { value: "Repos", label: "راحة" },
    ],
    dash: "-",
    loading: "جارٍ تحميل البيانات...",
    loadErrorTitle: "خطأ في تحميل البيانات",
    missingDataTitle: "خطأ: بيانات مفقودة من الخادم",
    missingDataDesc: "تحقق من الاتصال بقاعدة البيانات أو تواصل مع المسؤول.",
    errTitle: "خطأ",
    selectEmployeeErr: "يرجى اختيار موظف",
    saveOkTitle: "تم اقتراح الجدول", // Changed to "proposed" instead of "saved"
    saveOkDesc: "تم إرسال الجدول للمشرف للموافقة", // Updated message
    saveErrTitle: "خطأ",
    saveErrDesc: "تعذر اقتراح الجدول",
    monthlyPlan: "تخطيط الشهر",
    monthlyPlanSubtitle: (m) => `النقاط: 1 = فترة واحدة، 2 = مزدوج. الشهر المعروض: ${m}`,
    legendSimple: "فترة واحدة",
    legendDouble: "مزدوج",
    legendRest: "راحة / غير عامل",
    selectLocation: "مطعم",
    selectShiftShort: "الفترة",
    apply: "تطبيق",
    clear: "مسح",
    confirmPlan: "اقتراح التخطيط", // Changed to "Propose" instead of "Confirm"
    clearAll: "مسح الشهر",
    prevMonth: "الشهر السابق",
    nextMonth: "الشهر التالي",
    locationAbbrev: "مطعم",
    notifPlanOk: "تم إرسال تخطيط الشهر للمشرف للموافقة", // Updated message
    weeklyPlan: "الجدول الأسبوعي",
  },
}

function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("fr")
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("lang")
    if (stored === "ar" || stored === "fr") setLang(stored)
    else {
      localStorage.setItem("lang", "fr")
      setLang("fr")
    }
  }, [])
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.setAttribute("lang", lang)
    document.documentElement.setAttribute("dir", "ltr")
  }, [lang])
  return lang
}

type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

// Shift values kept as French constants to match backend expectations.
const SHIFT_VALUE_MORNING = "Matin"
const SHIFT_VALUE_EVENING = "Soirée"
const SHIFT_VALUE_DOUBLE = "Doublage"
const SHIFT_VALUE_OFF = "Repos"

// ----- Helpers for month calendar -----
function getMonthInfo(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth() // 0-11
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  // We use Monday as first day of week (1=Mon,...,7=Sun)
  const firstWeekday = (first.getDay() + 6) % 7 // 0..6 with 0=Mon
  const daysInMonth = last.getDate()
  const grid: (Date | null)[] = []
  for (let i = 0; i < firstWeekday; i++) grid.push(null)
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d))
  return { year, month, first, last, grid, daysInMonth }
}

function ymd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

// Normalizes various date inputs into "YYYY-MM-DD"
function normalizeDateKey(input: unknown): string {
  if (input == null) return ""
  if (typeof input === "string") {
    // Already "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input
    // Maybe a numeric string (epoch ms or seconds)
    const num = Number(input)
    if (Number.isFinite(num)) {
      const d =
        String(input).length >= 12 // heuristic: ms vs s
          ? new Date(num)
          : new Date(num * 1000)
      return ymd(d)
    }
    // Fallback: parseable date string
    const parsed = Date.parse(input)
    if (!Number.isNaN(parsed)) return ymd(new Date(parsed))
    return input
  }
  if (typeof input === "number" && Number.isFinite(input)) {
    // Assume epoch ms
    const d = new Date(input)
    return ymd(d)
  }
  try {
    const d = new Date(String(input))
    if (!Number.isNaN(d.getTime())) return ymd(d)
  } catch {}
  return ""
}

type DayAssignment = {
  shift: "Matin" | "Soirée" | "Doublage" | "Repos"
  location_id?: string
  job_position?: string
}

function getAbbrev(name: string | undefined | null, max = 3) {
  if (!name || typeof name !== "string" || !name.trim()) return ""
  const parts = name.trim().split(/\s+/)
  const letters = parts.map((p) => p[0]?.toUpperCase()).join("")
  const abbr = letters || name.slice(0, max).toUpperCase()
  return abbr.slice(0, max)
}

function getShiftTimes(locationId: string | number, shiftType: string) {
  const locId = String(locationId)

  if (locId === "1") {
    switch (shiftType) {
      case "Matin":
        return { start_time: "10:00", end_time: "18:00" }
      case "Doublage":
        return { start_time: "10:00", end_time: "02:00" }
      case "Soirée":
        return { start_time: "18:00", end_time: "02:00" }
      default:
        return { start_time: null, end_time: null }
    }
  } else if (locId === "2") {
    switch (shiftType) {
      case "Matin":
        return { start_time: "09:00", end_time: "17:00" }
      case "Doublage":
        return { start_time: "09:00", end_time: "01:00" }
      case "Soirée":
        return { start_time: "17:00", end_time: "01:00" }
      default:
        return { start_time: null, end_time: null }
    }
  } else if (locId === "3") {
    switch (shiftType) {
      case "Matin":
        return { start_time: "08:00", end_time: "16:00" }
      default:
        return { start_time: null, end_time: null }
    }
  }

  // Default fallback
  return { start_time: null, end_time: null }
}

// ----- Component -----
export default function ManagerJournalPage() {
  const lang = useLang()
  const t = translations[lang]
  const { toast } = useToast()
  const { user } = useAuth() // Added auth context for manager info

  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [schedule, setSchedule] = useState<Record<string, string>>({})
  const [jobPosition, setJobPosition] = useState("")
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")

  // New: monthly planner
  const [plannerOpen, setPlannerOpen] = useState(false)
  const [plannerMonth, setPlannerMonth] = useState<Date>(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [monthEdits, setMonthEdits] = useState<Record<string, DayAssignment>>({})
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [plannerLoading, setPlannerLoading] = useState(false)
  const [viewPlansOpen, setViewPlansOpen] = useState(false)
  const [plansLoading, setPlansLoading] = useState(false)
  const [monthlyPlans, setMonthlyPlans] = useState<any[]>([])

  const [currentDayAlerts, setCurrentDayAlerts] = useState<Record<string, boolean>>({})
  const [lastApiCall, setLastApiCall] = useState<number>(0)
  const [cachedSchedules, setCachedSchedules] = useState<any[]>([])

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set())
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [bulkShift, setBulkShift] = useState<"Matin" | "Soirée" | "Doublage" | "Repos">("Matin")
  const [bulkLocation, setBulkLocation] = useState<string>("")

  // GraphQL queries/mutations
  const {
    data: employeesData,
    error: employeesError,
    loading: employeesLoading,
  } = useQuery(GET_EMPLOYEES, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
  })
  const {
    data: locationsData,
    error: locationsError,
    loading: locationsLoading,
  } = useQuery(GET_LOCATIONS, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  })
  // Fetch all per-user schedules for all employees for the current week
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const weekStartStr = weekStart.toISOString().slice(0, 10)
  const weekEndStr = weekEnd.toISOString().slice(0, 10)
  const {
    data: allSchedulesData,
    error: allSchedulesError,
    loading: allSchedulesLoading,
    refetch,
  } = useQuery(GET_ALL_USER_WORK_SCHEDULES, {
    variables: { start: weekStartStr, end: weekEndStr },
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  })
  const [getRange, { data: rangeData }] = useLazyQuery(GET_WORK_SCHEDULES_RANGE)
  const [createUserSchedule] = useMutation(CREATE_USER_WORK_SCHEDULE, {
    refetchQueries: [
      { query: GET_ALL_USER_WORK_SCHEDULES, variables: { start: weekStartStr, end: weekEndStr } },
      { query: GET_WEEKLY_TEMPLATE_SCHEDULES },
    ],
    awaitRefetchQueries: true,
  })
  const [updateSchedule] = useMutation(UPDATE_WORK_SCHEDULE, {
    refetchQueries: [
      { query: GET_ALL_USER_WORK_SCHEDULES, variables: { start: weekStartStr, end: weekEndStr } },
      { query: GET_WEEKLY_TEMPLATE_SCHEDULES },
    ],
    awaitRefetchQueries: true,
  })
  const [notifyPlanning] = useMutation(NOTIFY_PLANNING_FOR_EMPLOYEE)
  const [sendApprovalRequest] = useMutation(SEND_APPROVAL_REQUEST) // Added for sending approval to admin
  const [createNotification] = useMutation(CREATE_NOTIFICATION) // Add notification mutation

  const {
    data: weeklyTemplateData,
    error: weeklyTemplateError,
    loading: weeklyTemplateLoading,
    refetch: refetchWeeklyTemplate,
  } = useQuery(GET_WEEKLY_TEMPLATE_SCHEDULES, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  })

  const managerLocation = useMemo(() => {
    if (!locationsData?.locations || !user?.location_id) return null
    return locationsData.locations.find((loc: any) => loc.id === user.location_id)
  }, [locationsData, user?.location_id])

  const allLocationsList = useMemo(() => {
    return (locationsData?.locations ?? []).map((l: any) => ({
      id: String(l.id),
      name: String(l.name ?? ""),
      short_name: String(l.short_name ?? ""),
    }))
  }, [locationsData])

  const top3Locations = useMemo(() => {
    return allLocationsList.slice(0, 3)
  }, [allLocationsList])

  const daysOfWeek = t.days
  const shifts = t.shifts

  const [grid, setGrid] = useState<(Date | null)[]>([])
  const [monthLabel, setMonthLabel] = useState("")

  useEffect(() => {
    const monthInfo = getMonthInfo(plannerMonth)
    setGrid(monthInfo.grid)
    setMonthLabel(
      new Intl.DateTimeFormat(lang === "ar" ? "ar-TN" : "fr-FR", {
        month: "long",
        year: "numeric",
      }).format(plannerMonth),
    )
  }, [plannerMonth, lang])

  // Build employees - Filter by manager's location
  const employees = useMemo(() => {
    if (!employeesData?.employees || !managerLocation) return []

    return (employeesData?.employees ?? [])
      .filter((emp: any) => emp.location?.id === managerLocation.id) // Filter by manager's location
      .map((emp: any) => ({
        id: emp.id,
        name: `${emp.prenom} ${emp.nom}`,
        position: emp.job_title,
        location: emp.location?.name || "",
        job_title: emp.job_title,
        prenom: emp.prenom,
        nom: emp.nom,
        profile: emp.profile,
        locationObj: emp.location,
      }))
  }, [employeesData, managerLocation])

  const allJobPositions: string[] = useMemo(
    () => Array.from(new Set(employees.map((emp: any) => emp.job_title).filter(Boolean))),
    [employees],
  )

  const locations = useMemo(
    () => Array.from(new Set(employees.map((emp: any) => emp.location))).filter(Boolean),
    [employees],
  )
  const filteredEmployees = useMemo(() => {
    let filtered = employees
    if (locationFilter && locationFilter !== "all") {
      filtered = filtered.filter((emp: any) => emp.locationObj?.id === locationFilter)
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase()
      filtered = filtered.filter(
        (emp: any) =>
          emp.name.toLowerCase().includes(term) ||
          emp.position?.toLowerCase().includes(term) ||
          emp.prenom?.toLowerCase().includes(term) ||
          emp.nom?.toLowerCase().includes(term),
      )
    }
    return filtered
  }, [employees, locationFilter, searchTerm])

  const selectedEmployeeData = useMemo(
    () => filteredEmployees.find((emp: any) => emp.id === selectedEmployee),
    [filteredEmployees, selectedEmployee],
  )

  // Helper: get the shift for an employee and day from allSchedulesData (array version)
  // Fix: Always match planning to the correct employee (employee.id === schedule.employee_id)
  function getEmployeeSchedule(employeeId: string, dayKey: string) {
    if (!weeklyTemplateData?.weeklyTemplateSchedules) return null

    // Find the schedule for this employee and this day of week
    const sched = weeklyTemplateData.weeklyTemplateSchedules.find((s: any) => {
      return String(s.employee_id) === String(employeeId) && s.day?.toLowerCase() === dayKey.toLowerCase()
    })

    if (sched && String(sched.employee_id) !== String(employeeId)) {
      return null
    }

    return sched
      ? {
          shift: sched.shift_type as string,
          job: sched.job_position as string,
          location_id: sched.location_id,
        }
      : null
  }

  // ----- Monthly Planner logic -----
  // Always fetch and show the latest saved planning for the selected employee and month
  const openPlanner = async (employeeId?: string) => {
    const targetEmployee = employeeId || selectedEmployee
    if (!targetEmployee) {
      toast({ title: t.errTitle, description: t.selectEmployeeErr, variant: "destructive" })
      return
    }
    try {
      setPlannerLoading(true)
      // Always refetch all relevant queries before opening planner
      await refetch()
      await refetchWeeklyTemplate()
      if (employeeId) {
        setSelectedEmployee(employeeId)
      }
      // Always fetch the latest planning for the selected month from backend
      const { first, last } = getMonthInfo(plannerMonth)
      const start = first.toISOString().slice(0, 10)
      const end = last.toISOString().slice(0, 10)
      const res = await getRange({
        variables: { employee_id: targetEmployee, start, end },
        fetchPolicy: "network-only",
      })
      const existing = (res.data?.workSchedulesRange ?? []) as any[]
      const prefilled: Record<string, DayAssignment> = {}
      existing.forEach((s: any) => {
        if (s?.date) {
          const key = normalizeDateKey(s.date)
          if (!key) return
          prefilled[key] = {
            shift: (s.shift_type as DayAssignment["shift"]) ?? "Repos",
            location_id: s.shift_type === "Repos" ? "0" : (s.location_id?.toString() ?? undefined),
            job_position: s.job_position ?? undefined,
          }
        }
      })
      setMonthEdits(prefilled)
      setPlannerOpen(true)
    } finally {
      setPlannerLoading(false)
    }
  }

  const changeMonth = (delta: number) => {
    const d = new Date(plannerMonth)
    d.setMonth(d.getMonth() + delta)
    setPlannerMonth(d)
    setEditingDay(null)
  }

  const applyForDay = (dateStr: string, payload: DayAssignment | null) => {
    setMonthEdits((prev) => {
      const next = { ...prev }
      if (!payload) {
        delete next[dateStr]
      } else if (payload.shift === "Repos") {
        next[dateStr] = { ...payload, location_id: "0" }
      } else {
        next[dateStr] = payload
      }
      return next
    })
    setEditingDay(null)
  }

  const clearAllMonth = () => {
    setMonthEdits({})
    setEditingDay(null)
  }

  // Save month plan - Updated to use manager mutation and send approval
  const saveMonth = async () => {
    if (!selectedEmployee) {
      toast({ title: t.errTitle, description: t.selectEmployeeErr, variant: "destructive" })
      return
    }
    try {
      const entries = Object.entries(monthEdits)
      if (entries.length === 0) {
        setPlannerOpen(false)
        await refetch()
        return
      }

      const employeeData = selectedEmployeeData
      const defaultLocationId = employeeData?.locationObj?.id || allLocationsList[0]?.id

      if (!defaultLocationId) {
        toast({
          title: t.saveErrTitle,
          description: "Aucun restaurant trouvé pour cet employé",
          variant: "destructive",
        })
        return
      }

      const schedules = entries
        .map(([dateKey, assign]) => {
          const normalized = normalizeDateKey(dateKey)
          if (!normalized) return null

          const finalLocationId =
            assign.shift === "Repos"
              ? "0"
              : assign.location_id && assign.location_id !== "0"
                ? String(assign.location_id)
                : String(defaultLocationId)

          const { start_time, end_time } = getShiftTimes(finalLocationId, assign.shift)
          const is_working = assign.shift !== "Repos"

          const dayName = new Date(normalized).toLocaleDateString("en-US", { weekday: "long" })
          return {
            employee_id: String(selectedEmployee),
            date: normalized,
            start_time,
            end_time,
            shift_type: assign.shift,
            job_position: jobPosition || selectedEmployeeData?.job_title || "",
            is_working,
            location_id: finalLocationId,
            day: dayName,
            retard: null,
            status: "manager",
          }
        })
        .filter(Boolean)

      const result = await createUserSchedule({
        variables: {
          employee_id: selectedEmployee,
          schedules,
          requesting_user_id: user?.id,
          requesting_user_role: "manager",
        },
      })

      const currentDate = new Date()
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

      await sendApprovalRequest({
        variables: {
          type: "planning_approval",
          reference_id: result?.data?.createUserWorkSchedule?.[0]?.id || null,
          manager_id: user?.id,
          employee_id: selectedEmployee,
          data: JSON.stringify({
            schedule: monthEdits,
            employee_id: selectedEmployee,
            employee_name: selectedEmployeeData?.name,
            manager_username: user?.username,
            location: managerLocation?.name,
            schedules: schedules,
          }),
          month: currentMonth,
        },
      })

      await createNotification({
        variables: {
          user_id: "1", // Admin user ID
          title: "📅 Planning proposé",
          role: "admin",
          message: `${user?.username} a proposé un planning pour ${selectedEmployeeData?.name}`,
          type: "planning_proposal",
          reference_id: selectedEmployee,
        },
      })

      toast({
        title: "📅 Proposition envoyée",
        description: "Votre proposition de planning a été envoyée à l'administration pour approbation.",
      })

      // After saving, reload the latest planning for this employee and month
      const { first, last } = getMonthInfo(plannerMonth)
      const start = first.toISOString().slice(0, 10)
      const end = last.toISOString().slice(0, 10)
      const res = await getRange({ variables: { employee_id: selectedEmployee, start, end } })
      const existing = (res.data?.workSchedulesRange ?? []) as any[]
      const prefilled: Record<string, DayAssignment> = {}
      existing.forEach((s: any) => {
        if (s?.date) {
          const key = normalizeDateKey(s.date)
          if (!key) return
          prefilled[key] = {
            shift: (s.shift_type as DayAssignment["shift"]) ?? "Repos",
            location_id: s.shift_type === "Repos" ? "0" : (s.location_id?.toString() ?? undefined),
            job_position: s.job_position ?? undefined,
          }
        }
      })
      setMonthEdits(prefilled)
      // Optionally keep the dialog open, or close as before
      // setPlannerOpen(false)
      await refetch()
    } catch (e) {
      console.error("Error saving month schedule:", e)
      toast({ title: t.saveErrTitle, description: t.saveErrDesc, variant: "destructive" })
    }
  }

  const applyToNextMonth = async () => {
    if (!selectedEmployee || Object.keys(monthEdits).length === 0) {
      toast({
        title: t.errTitle,
        description: "Veuillez sélectionner un employé et définir un planning pour le mois actuel",
        variant: "destructive",
      })
      return
    }

    try {
      setPlannerLoading(true)

      // Get next month
      const nextMonth = new Date(plannerMonth)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      const { first, last } = getMonthInfo(nextMonth)
      const employeeData = selectedEmployeeData
      const defaultLocationId = employeeData?.locationObj?.id || allLocationsList[0]?.id

      if (!defaultLocationId) {
        toast({
          title: t.saveErrTitle,
          description: "Aucun restaurant trouvé pour cet employé",
          variant: "destructive",
        })
        return
      }

      // Apply current month pattern to next month
      const schedules = []
      for (let d = 1; d <= last.getDate(); d++) {
        const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), d)
        const dayOfWeek = date.getDay() // 0=Sunday, 1=Monday, etc.

        // Find a matching day pattern from current month edits
        const currentMonthPattern = Object.entries(monthEdits).find(([_, assign]) => {
          const patternDate = new Date(_.split("-").map(Number))
          return patternDate.getDay() === dayOfWeek
        })

        if (currentMonthPattern) {
          const [_, assign] = currentMonthPattern
          const dateStr = ymd(date)

          const finalLocationId =
            assign.shift === "Repos"
              ? "0"
              : assign.location_id && assign.location_id !== "0"
                ? String(assign.location_id)
                : String(defaultLocationId)

          const { start_time, end_time } = getShiftTimes(finalLocationId, assign.shift)
          const is_working = assign.shift !== "Repos"

          const dayName = date.toLocaleDateString("en-US", { weekday: "long" })

          schedules.push({
            employee_id: String(selectedEmployee),
            date: dateStr,
            start_time,
            end_time,
            shift_type: assign.shift,
            job_position: jobPosition || selectedEmployeeData?.job_title || "",
            is_working, // Always true for manager schedules
            location_id: finalLocationId,
            day: dayName,
            retard: null,
            status: "manager",
          })
        }
      }

      if (schedules.length > 0) {
        const result = await createUserSchedule({
          // Using the same mutation as admin
          variables: {
            employee_id: selectedEmployee,
            schedules,
          },
        })

        const ym = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`
        await sendApprovalRequest({
          variables: {
            type: "planning_approval",
            reference_id: result?.data?.createUserWorkSchedule?.[0]?.id || null,
            manager_id: user?.id,
            employee_id: selectedEmployee,
            data: JSON.stringify({
              schedule: monthEdits,
              employee_id: selectedEmployee,
              employee_name: selectedEmployeeData?.name,
              manager_username: user?.username,
              location: managerLocation?.name,
              schedules: schedules,
            }),
            month: ym,
          },
        })

        toast({
          title: "Succès",
          description: `Planning proposé pour le mois prochain (${nextMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })})`, // Updated message
        })
      }
    } catch (error) {
      console.error("Error applying to next month:", error)
      toast({
        title: t.saveErrTitle,
        description: "Erreur lors de la proposition pour le mois prochain",
        variant: "destructive",
      })
    } finally {
      setPlannerLoading(false)
    }
  }

  const applyToEntireYear = async () => {
    if (!selectedEmployee || Object.keys(monthEdits).length === 0) {
      toast({
        title: t.errTitle,
        description: "Veuillez sélectionner un employé et définir un planning pour le mois actuel",
        variant: "destructive",
      })
      return
    }

    try {
      setPlannerLoading(true)

      const employeeData = selectedEmployeeData
      const defaultLocationId = employeeData?.locationObj?.id || allLocationsList[0]?.id

      if (!defaultLocationId) {
        toast({
          title: t.saveErrTitle,
          description: "Aucun restaurant trouvé pour cet employé",
          variant: "destructive",
        })
        return
      }

      // Apply pattern to entire year (12 months)
      const currentYear = plannerMonth.getFullYear()

      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const targetMonth = new Date(currentYear, monthIndex, 1)
        const { last } = getMonthInfo(targetMonth)

        const schedules = []
        for (let d = 1; d <= last.getDate(); d++) {
          const date = new Date(currentYear, monthIndex, d)
          const dayOfWeek = date.getDay()

          // Find matching day pattern from current month edits
          const currentMonthPattern = Object.entries(monthEdits).find(([_, assign]) => {
            const patternDate = new Date(_.split("-").map(Number))
            return patternDate.getDay() === dayOfWeek
          })

          if (currentMonthPattern) {
            const [_, assign] = currentMonthPattern
            const dateStr = ymd(date)

            const finalLocationId =
              assign.shift === "Repos"
                ? "0"
                : assign.location_id && assign.location_id !== "0"
                  ? String(assign.location_id)
                  : String(defaultLocationId)

            const { start_time, end_time } = getShiftTimes(finalLocationId, assign.shift)
            const is_working = assign.shift !== "Repos"

            const dayName = date.toLocaleDateString("en-US", { weekday: "long" })

            schedules.push({
              employee_id: String(selectedEmployee),
              date: dateStr,
              start_time,
              end_time,
              shift_type: assign.shift,
              job_position: jobPosition || selectedEmployeeData?.job_title || "",
              is_working, // Always true for manager schedules
              location_id: finalLocationId,
              day: dayName,
              retard: null,
              status: "manager",
            })
          }
        }

        if (schedules.length > 0) {
          const result = await createUserSchedule({
            // Using the same mutation as admin
            variables: {
              employee_id: selectedEmployee,
              schedules,
            },
          })

          const ym = `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}`
          await sendApprovalRequest({
            variables: {
              type: "planning_approval",
              reference_id: result?.data?.createUserWorkSchedule?.[0]?.id || null,
              manager_id: user?.id,
              employee_id: selectedEmployee,
              data: JSON.stringify({
                schedule: monthEdits,
                employee_id: selectedEmployee,
                employee_name: selectedEmployeeData?.name,
                manager_username: user?.username,
                location: managerLocation?.name,
                schedules: schedules,
              }),
              month: ym,
            },
          })
        }
      }

      toast({
        title: "Succès",
        description: `Planning proposé pour toute l'année ${currentYear}`, // Updated message
      })
    } catch (error) {
      console.error("Error applying to entire year:", error)
      toast({
        title: t.saveErrTitle,
        description: "Erreur lors de la proposition pour l'année",
        variant: "destructive",
      })
    } finally {
      setPlannerLoading(false)
    }
  }

  const startLongPress = (dateStr: string) => {
    const timer = setTimeout(() => {
      setIsSelectionMode(true)
      setSelectedDays(new Set([dateStr]))
      // Haptic feedback simulation
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500) // 500ms long press
    setLongPressTimer(timer)
  }

  const cancelLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const toggleDaySelection = (dateStr: string) => {
    if (!isSelectionMode) return

    setSelectedDays((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr)
      } else {
        newSet.add(dateStr)
      }
      return newSet
    })
  }

  const exitSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedDays(new Set())
    setBulkShift("Matin")
    setBulkLocation("")
  }

  const applyBulkChanges = () => {
    if (selectedDays.size === 0) return

    const payload: DayAssignment = {
      shift: bulkShift,
      location_id: bulkShift === "Repos" ? "0" : bulkLocation || selectedEmployeeData?.locationObj?.id,
      job_position: selectedEmployeeData?.job_title,
    }

    selectedDays.forEach((dateStr) => {
      applyForDay(dateStr, payload)
    })

    exitSelectionMode()
    toast({
      title: "Planification mise à jour",
      description: `${selectedDays.size} jour(s) mis à jour avec succès`,
    })
  }

  // UI helpers
  const handleScheduleChange = (day: string, shift: string) => {
    setSchedule((prev) => ({ ...prev, [day]: shift }))
  }
  const handleSelectChange = (day: string) => (value: string) => {
    handleScheduleChange(day, value)
  }

  const currentWeekStart = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 (Sunday) to 6 (Saturday)
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // adjust when day is sunday
    return new Date(today.setDate(diff))
  }, [])

  const checkCurrentDayAssignments = useMemo(() => {
    const alerts: Record<string, boolean> = {}
    if (employeesData?.employees && allSchedulesData?.allUserWorkSchedules) {
      const employees = employeesData.employees
      const allSchedules = allSchedulesData.allUserWorkSchedules

      employees.forEach((employee: any) => {
        // Check if employee has planning for all 7 days in current week view
        const currentWeekDates = []
        for (let i = 0; i < 7; i++) {
          const date = new Date(currentWeekStart)
          date.setDate(date.getDate() + i)
          currentWeekDates.push(ymd(date))
        }

        // Check if employee has schedule for all days in the current week
        const hasCompleteWeekPlanning = currentWeekDates.every((dateKey) => {
          return allSchedules.some(
            (s: any) => String(s.employee_id) === String(employee.id) && normalizeDateKey(s.date) === dateKey,
          )
        })

        // Only show alert if employee is missing planning for any day in the current week
        if (!hasCompleteWeekPlanning) {
          alerts[employee.id] = true
        }
      })
    }
    return alerts
  }, [employeesData, allSchedulesData, currentWeekStart])

  useEffect(() => {
    setCurrentDayAlerts(checkCurrentDayAssignments)
  }, [checkCurrentDayAssignments])

  const optimizedRefetch = useMemo(() => {
    return () => {
      const now = Date.now()
      if (now - lastApiCall < 30000) {
        // Prevent API calls more frequent than 30 seconds
        return Promise.resolve()
      }
      setLastApiCall(now)
      return refetch()
    }
  }, [refetch, lastApiCall])

  function getCurrentDayRestaurantStatus(employeeId: string) {
    const today = new Date()
    const todayKey = ymd(today)

    if (!allSchedulesData?.allUserWorkSchedules) return { needsUpdate: true, restaurant: null, shift: null }

    const todaySchedule = allSchedulesData.allUserWorkSchedules.find(
      (s: any) => String(s.employee_id) === String(employeeId) && normalizeDateKey(s.date) === todayKey,
    )

    const employee = employeesData?.employees?.find((emp: any) => emp.id === employeeId)
    const restaurant = employee?.location?.name

    const needsUpdate =
      !todaySchedule || !todaySchedule.shift_type || (todaySchedule.shift_type !== "Repos" && !restaurant)

    return {
      needsUpdate,
      restaurant,
      shift: todaySchedule?.shift_type,
      restaurantCode: restaurant ? getAbbrev(restaurant, 3) : null,
    }
  }

  const handlePlanningClick = (employeeId: string) => {
    setSelectedEmployee(employeeId)
    setViewPlansOpen(true)
    // Automatically load the current month's planning
    const now = new Date()
    setPlannerMonth(now)
  }

  if (employees.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <h2 className="text-white/90 font-semibold mb-1" dir="auto">
          Aucun employé trouvé
        </h2>
        <p dir="auto">Aucun employé n'est assigné à votre restaurant ({managerLocation?.name || "Non défini"})</p>
      </div>
    )
  }

  // ----- Render -----
  return (
    <div className="min-h-screen relative overflow-hidden" dir="ltr">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-green-900/60 to-slate-900/80 backdrop-blur-[6px]" />{" "}
        {/* Changed color scheme to green for manager */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-30 animate-float" // Changed color scheme to green
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="space-y-6 p-4 relative z-20 max-w-full mx-auto">
        {/* Header */}
        <div className="glass-card backdrop-blur-futuristic p-4 lg:p-6 text-white shadow-2xl animate-fade-in relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-green-900/40 to-blue-900/30 opacity-70 rounded-2xl" />{" "}
          {/* Changed color scheme to green */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] rounded-2xl" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700/40 to-green-700/40 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
              {" "}
              {/* Changed color scheme to green */}
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent" // Changed color scheme to green
                dir="auto"
              >
                {t.pageTitle}
              </h1>
              <p className="text-slate-200 text-sm md:text-base" dir="auto">
                {t.pageSubtitle}
              </p>
              <p className="text-green-300 text-xs mt-1" dir="auto">
                Restaurant: {managerLocation?.name || "Non défini"}
              </p>
            </div>
            {Object.keys(currentDayAlerts).length > 0 && (
              <div className="flex items-center space-x-2 bg-orange-600/20 border border-orange-500/30 rounded-lg px-3 py-2 w-full sm:w-auto">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0" />
                <div className="text-sm min-w-0">
                  <div className="text-orange-200 font-medium">{Object.keys(currentDayAlerts).length} employé(s)</div>
                  <div className="text-orange-300 text-xs truncate">Besoin d'assignation restaurant</div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Filters */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg sm:text-xl" dir="auto">
              {t.filters || "Filtres"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Search Input */}
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={t.searchPlaceholder || "Rechercher par nom..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
              {/* Selects */}
              {/* <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-full glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder={t.restaurant || "Restaurant"} />
                    </SelectTrigger>
                    <SelectContent className="glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 shadow-xl">
                      <SelectItem value="all" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">
                        <span dir="auto">{t.allRestaurants || "Tous les restaurants"}</span>
                      </SelectItem>
                      {allLocationsList.map((location: any) => (
                        <SelectItem
                          key={location.id}
                          value={location.id}
                          className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80"
                        >
                          <span dir="auto">{location.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div> */}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule Table (kept) */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
          {" "}
          {/* Changed color scheme to green */}
          <CardHeader>
            <CardTitle dir="auto">{t.weeklyTitle}</CardTitle>
            <CardDescription dir="auto">{t.weeklySubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-white">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold" dir="auto">
                      {t.thEmployee}
                    </th>
                    {daysOfWeek.map((day) => (
                      <th key={day.key} className="text-center p-3 font-semibold" dir="auto">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp: any) => {
                    const needsCurrentDayUpdate = currentDayAlerts[emp.id]

                    return (
                      <tr key={emp.id} className="border-b hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-700/60 to-green-700/60 text-white">
                                {" "}
                                {/* Changed color scheme to green */}
                                {emp.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-sm truncate" dir="auto">
                                  {emp.name}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground truncate" dir="auto">
                                {emp.position || t.dash}
                              </p>
                              <div className="mt-2 flex gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="bg-emerald-700/30 hover:bg-emerald-700/40 text-emerald-100 border border-emerald-500/30"
                                  onClick={() => {
                                    openPlanner(emp.id)
                                  }}
                                >
                                  Planning
                                </Button>
                              </div>
                            </div>
                          </div>
                        </td>
                        {daysOfWeek.map((day) => {
                          const schedule = getEmployeeSchedule(emp.id, day.key)
                          // Fix: Correctly determine if this cell is today
                          const today = new Date()
                          // Monday is index 0 in daysOfWeek
                          const todayIndex = (today.getDay() + 6) % 7
                          const dayIndex = daysOfWeek.findIndex((d) => d.key === day.key)
                          const isToday = dayIndex === todayIndex
                          const todayNeedsUpdate = isToday && needsCurrentDayUpdate

                          return (
                            <td key={day.key} className="text-center p-3">
                              {schedule ? (
                                <div className="space-y-1">
                                  <Badge
                                    variant={schedule.shift === "Repos" ? "outline" : "default"}
                                    className={`text-xs ${
                                      schedule.shift === "Matin"
                                        ? "bg-blue-700/30 text-blue-200"
                                        : schedule.shift === "Soirée"
                                          ? "bg-purple-700/30 text-purple-200"
                                          : schedule.shift === "Doublage"
                                            ? "bg-orange-700/30 text-orange-200"
                                            : schedule.shift === "Repos"
                                              ? "bg-gray-700/30 text-gray-200 border-gray-500/50"
                                              : "bg-slate-700/30 text-slate-200"
                                    }`}
                                  >
                                    {schedule.shift}
                                  </Badge>
                                  {schedule.job && schedule.shift !== "Repos" && (
                                    <div className="text-xs text-muted-foreground">{schedule.job}</div>
                                  )}
                                  {schedule.shift === "Repos" && (
                                    <div className="text-xs font-bold text-gray-300">REP</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">{t.dash}</span>
                              )}
                              {isToday && emp.location && schedule?.shift !== "Repos" && (
                                <div className="text-xs text-blue-300 mt-1">{getAbbrev(emp.location.name, 3)}</div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Planner Dialog */}
      <Dialog open={plannerOpen} onOpenChange={setPlannerOpen}>
        <DialogContent className="w-[98vw] max-w-6xl mx-auto max-h-[95vh] overflow-y-auto glass-card bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-900/95 border border-white/10 text-white p-0">
          <DialogHeader className="sticky top-0 z-10 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-4">
            <DialogTitle>
              {selectedEmployeeData
                ? `Planning du mois — ${selectedEmployeeData.prenom} ${selectedEmployeeData.nom}`
                : t.monthlyPlan}
            </DialogTitle>
            <DialogDescription>{t.monthlyPlanSubtitle(monthLabel)}</DialogDescription>
            {selectedEmployee && currentDayAlerts[selectedEmployee] && (
              <div className="flex items-center space-x-2 bg-orange-600/20 border border-orange-500/30 rounded-lg px-3 py-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-200">
                  Cet employé a besoin d'une assignation restaurant pour aujourd'hui
                </span>
              </div>
            )}
          </DialogHeader>

          <div className="px-4 py-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-300">{t.legendSimple}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex flex-col gap-0.5">
                    <span className="block w-2.5 h-2 rounded-full bg-cyan-400" />
                    <span className="block w-2.5 h-2 rounded-full bg-cyan-400" />
                  </span>
                  <span className="text-xs text-slate-300">{t.legendDouble}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500" />
                  <span className="text-xs text-slate-300">{t.legendRest}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} aria-label={t.prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm">{monthLabel}</div>
                <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} aria-label={t.nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-7 gap-1 text-xs text-slate-400 mb-2">
                <div className="text-center">Lun</div>
                <div className="text-center">Mar</div>
                <div className="text-center">Mer</div>
                <div className="text-center">Jeu</div>
                <div className="text-center">Ven</div>
                <div className="text-center">Sam</div>
                <div className="text-center">Dim</div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {grid.map((d, idx) => {
                  if (!d) return <div key={`empty-${idx}`} />
                  const ds = ymd(d)
                  const assign = monthEdits[ds]
                  const shift = assign?.shift
                  const isDouble = shift === "Doublage"
                  const isSimple = shift === "Matin" || shift === "Soirée"
                  const isRepos = shift === "Repos"

                  const isToday = ds === ymd(new Date())
                  const todayNeedsUpdate = isToday && selectedEmployee && currentDayAlerts[selectedEmployee]
                  const isSelected = selectedDays.has(ds)

                  return (
                    <Popover
                      key={ds}
                      open={!isSelectionMode && editingDay === ds}
                      onOpenChange={(o) => setEditingDay(o ? ds : null)}
                    >
                      <PopoverTrigger asChild>
                        <button
                          className={`relative rounded-lg px-1 pt-2 pb-4 text-left transition-all duration-200 h-16 sm:h-20 w-full ${
                            isSelected
                              ? "bg-blue-500/40 border-2 border-blue-400 scale-95 shadow-lg shadow-blue-500/25"
                              : todayNeedsUpdate
                                ? "bg-orange-600/20 hover:bg-orange-600/30 border-2 border-orange-500/50 animate-pulse"
                                : isToday
                                  ? "bg-blue-600/20 hover:bg-blue-600/30 border-2 border-blue-500/50"
                                  : "bg-white/5 hover:bg-white/10 border border-white/10"
                          } ${isSelectionMode ? "cursor-pointer" : ""}`}
                          onMouseDown={() => !isSelectionMode && startLongPress(ds)}
                          onMouseUp={cancelLongPress}
                          onMouseLeave={cancelLongPress}
                          onTouchStart={() => !isSelectionMode && startLongPress(ds)}
                          onTouchEnd={cancelLongPress}
                          onClick={() => {
                            if (isSelectionMode) {
                              toggleDaySelection(ds)
                            } else {
                              cancelLongPress()
                              setEditingDay(ds)
                            }
                          }}
                        >
                          <span
                            className={`text-xs font-medium block ${
                              isSelected
                                ? "text-blue-100"
                                : todayNeedsUpdate
                                  ? "text-orange-200"
                                  : isToday
                                    ? "text-blue-200"
                                    : "text-slate-200"
                            }`}
                          >
                            {d.getDate()}
                          </span>

                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}

                          {!isSelected && isToday && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                          )}

                          {!isSelected && todayNeedsUpdate && (
                            <AlertTriangle className="absolute top-1 right-1 w-3 h-3 text-orange-400" />
                          )}

                          <div className="absolute left-1 bottom-1 flex flex-col items-start gap-0.5">
                            {isDouble ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                              </>
                            ) : isSimple ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            ) : isRepos ? (
                              <span className="w-2 h-2 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.6)]" />
                            ) : null}
                          </div>

                          {assign?.location_id && assign?.location_id !== "0" && (
                            <span
                              className="absolute right-1 bottom-1 text-[9px] px-1 py-0.5 rounded-md bg-slate-800/70 text-slate-100 border border-white/10"
                              title={allLocationsList.find((l: any) => l.id === assign.location_id)?.name ?? ""}
                              aria-label={`Restaurant ${allLocationsList.find((l: any) => l.id === assign.location_id)?.name ?? ""}`}
                            >
                              {getAbbrev(allLocationsList.find((l: any) => l.id === assign.location_id)?.name ?? "", 3)}
                            </span>
                          )}

                          {(assign?.location_id === "0" || assign?.shift === "Repos") && (
                            <span
                              className="absolute right-1 bottom-1 text-[10px] font-bold text-white bg-gray-600/80 px-1 rounded"
                              title="Repos"
                            >
                              REP
                            </span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 bg-gradient-to-br from-slate-900/95 to-slate-900/95 border border-white/10 text-white">
                        <div className="p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-300">
                              {new Intl.DateTimeFormat("fr-FR", {
                                weekday: "long",
                                day: "2-digit",
                                month: "long",
                              }).format(d)}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setEditingDay(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs text-slate-400 uppercase tracking-wide">{t.selectShiftShort}</div>
                            <div className="grid grid-cols-2 gap-2">
                              {shifts.map((shift) => (
                                <Button
                                  key={shift.value}
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    applyForDay(ds, {
                                      shift: shift.value,
                                      location_id:
                                        shift.value === "Repos" ? "0" : selectedEmployeeData?.locationObj?.id,
                                      job_position: selectedEmployeeData?.job_title,
                                    })
                                  }
                                  className={`text-xs h-8 ${
                                    assign?.shift === shift.value
                                      ? "bg-blue-600/30 border-blue-500/50 text-blue-200"
                                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                                  }`}
                                >
                                  {shift.value}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {top3Locations.length > 0 && assign?.shift !== "Repos" && (
                            <div className="space-y-2">
                              <div className="text-xs text-slate-400 uppercase tracking-wide">{t.selectLocation}</div>
                              <Select
                                value={assign?.location_id && assign?.location_id !== "0" ? assign.location_id : ""}
                                onValueChange={(locationId) => {
                                  if (assign) {
                                    applyForDay(ds, { ...assign, location_id: locationId })
                                  }
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-white">
                                  <SelectValue placeholder="Choisir restaurant" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10">
                                  {top3Locations.map((loc: any) => (
                                    <SelectItem key={loc.id} value={loc.id} className="text-white hover:bg-white/10">
                                      {loc.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => applyForDay(ds, null)}
                              className="flex-1 h-8 text-xs bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                            >
                              {t.clear}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setEditingDay(null)}
                              className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {t.apply}
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
                })}
              </div>
            </div>

            {isSelectionMode && (
              <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-slate-900/80 backdrop-blur-md border-t border-white/10 p-4 z-50">
                <div className="max-w-6xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-white">
                        {selectedDays.size} jour{selectedDays.size > 1 ? "s" : ""} sélectionné
                        {selectedDays.size > 1 ? "s" : ""}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={exitSelectionMode}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Annuler
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-300">Type de shift:</label>
                      <Select value={bulkShift} onValueChange={(value: any) => setBulkShift(value)}>
                        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                          {shifts.map((shift) => (
                            <SelectItem key={shift.value} value={shift.value} className="text-white hover:bg-white/10">
                              {shift.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {bulkShift !== "Repos" && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-300">Restaurant:</label>
                        <Select value={bulkLocation} onValueChange={setBulkLocation}>
                          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10">
                            {allLocationsList.map((location: any) => (
                              <SelectItem
                                key={location.id}
                                value={location.id}
                                className="text-white hover:bg-white/10"
                              >
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button
                      onClick={applyBulkChanges}
                      disabled={selectedDays.size === 0 || (bulkShift !== "Repos" && !bulkLocation)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Appliquer à {selectedDays.size} jour{selectedDays.size > 1 ? "s" : ""}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <Button
                variant="outline"
                onClick={clearAllMonth}
                className="text-slate-300 border-white/20 hover:bg-white/10 bg-transparent"
              >
                {t.clearAll}
              </Button>
              <Button
                variant="outline"
                className="text-slate-300 border-white/20 hover:bg-white/10 bg-transparent"
                onClick={applyToNextMonth}
                disabled={plannerLoading}
              >
                mois prochain
              </Button>

              <Button
                variant="outline"
                className="text-slate-300 border-white/20 hover:bg-white/10 bg-transparent"
                onClick={applyToEntireYear}
                disabled={plannerLoading}
              >
                année
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPlannerOpen(false)}
                  className="text-slate-300 border-white/20 hover:bg-white/10 bg-transparent"
                >
                  Annuler
                </Button>

                <Button
                  onClick={async () => {
                    await saveMonth()
                    setPlannerOpen(false)
                  }}
                  disabled={plannerLoading}
                  className="bg-green-600 hover:bg-green-700 text-white" // Changed to green for manager
                >
                  {plannerLoading ? "Proposition..." : t.confirmPlan} {/* Updated loading text */}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
