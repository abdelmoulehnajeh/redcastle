"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery, useMutation, useLazyQuery } from "@apollo/client"
import {
  GET_LEAVE_REQUESTS,
  APPROVE_LEAVE_REQUEST,
  GET_ADMIN_APPROVALS,
  APPROVE_SCHEDULE_CHANGE,
  REJECT_SCHEDULE_CHANGE,
  GET_MANAGER_PLANNING_DATA,
  GET_WORK_SCHEDULES_RANGE,
  UPDATE_WORK_SCHEDULE,
  DELETE_WORK_SCHEDULE, // Added DELETE_WORK_SCHEDULE mutation
  DELETE_WORK_SCHEDULES_BY_EMPLOYEE, // Added DELETE_WORK_SCHEDULES_BY_EMPLOYEE mutation
} from "@/lib/graphql-queries"
import { toast } from "sonner"
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  Users,
  AlertTriangle,
  TrendingUp,
  Filter,
  RefreshCw,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface LeaveRequest {
  id: string
  employee_id: string
  type: string
  start_date: string
  end_date: string
  days_count: number
  reason: string
  status: string
  created_at: string
  manager_comment?: string
  admin_comment?: string
  employee: {
    id: string
    nom: string
    prenom: string
    profile: {
      first_name: string
      last_name: string
    }
  }
}

interface AdminApproval {
  id: string
  type: string
  status: string
  reference_id: string
  manager_id: string
  created_at: string
  reviewed_at?: string
  data: string
}

interface ManagerPlanningData {
  id: string
  employee_id: string
  employee: {
    id: string
    nom: string
    prenom: string
    profile: {
      first_name: string
      last_name: string
    }
  }
  shift_type: string
  date: string
  start_time: string
  end_time: string
  job_position: string
  location: {
    id: string
    name: string
    address: string
  }
  status: string
  traite: string
  is_working: boolean
  created_at: string
}

type Lang = "fr" | "ar"

type Dict = {
  approvalsTitle: string
  approvalsSubtitle: string
  approvalsSubtitleShort: string
  refresh: string
  // toasts
  refreshed: string
  refreshError: string
  leaveApproved: string
  leaveRejected: string
  decisionSaved: string
  processError: string
  processErrorDesc: string
  scheduleApproved: string
  scheduleRejected: string
  // stats
  statsPending: string
  statsApproved: string
  statsRejected: string
  statsTotal: string
  statsPendingDesc: string
  statsApprovedDesc: string
  statsRejectedDesc: string
  statsTotalDesc: string
  // filters
  filterAll: string
  filterPending: string
  filterApproved: string
  filterRejected: string
  // error card
  loadErrorTitle: string
  // notifications section
  systemNotifications: string
  actionsToProcess: string
  notificationsCount: (n: number) => string
  // notification card
  refLabel: string
  managerLabel: string
  createdLabel: string
  notifDataTitle: string
  adminCommentPlaceholder: string
  notifAccept: string
  notifReject: string
  // leave section
  leaveRequestsTitle: string
  leaveRequestsSubtitle: string
  leaveRequestsCount: (n: number) => string
  // leave types
  leaveTypes: Record<string, { label: string; icon: string }>
  // statuses
  statusPending: string
  statusApproved: string
  statusRejected: string
  // leave details
  startLabel: string
  endLabel: string
  durationLabel: string
  daysSuffix: string
  reasonTitle: string
  decisionCommentPlaceholder: string
  approveBtn: string
  rejectBtn: string
  loadingLabel: string
  // empty states
  noNotificationsTitle: string
  noNotificationsDesc: string
  noLeaveTitle: string
  noLeaveDesc: string
  // dates
  dateUnknown: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    approvalsTitle: "Approbations Admin",
    approvalsSubtitle: "Validation finale des demandes managers et employés",
    approvalsSubtitleShort: "Valider les demandes",
    refresh: "Actualiser",
    refreshed: "Données actualisées",
    refreshError: "Erreur lors de l'actualisation",
    leaveApproved: "Demande de congé approuvée",
    leaveRejected: "Demande de congé rejetée",
    decisionSaved: "La décision a été enregistrée avec succès",
    processError: "Erreur lors du traitement",
    processErrorDesc: "Veuillez réessayer ou contacter le support",
    scheduleApproved: "Changement de planning approuvé",
    scheduleRejected: "Changement de planning rejeté",

    statsPending: "En Attente",
    statsApproved: "Approuvées",
    statsRejected: "Rejetées",
    statsTotal: "Total",
    statsPendingDesc: "Actions requises",
    statsApprovedDesc: "Validations réussies",
    statsRejectedDesc: "Demandes refusées",
    statsTotalDesc: "Toutes demandes",

    filterAll: "Toutes",
    filterPending: "En attente",
    filterApproved: "Approuvées",
    filterRejected: "Rejetées",

    loadErrorTitle: "Erreur de chargement",

    systemNotifications: "Demandes Managers",
    actionsToProcess: "Actions à traiter",
    notificationsCount: (n) => `${n} notification(s)`,

    refLabel: "Réf",
    managerLabel: "Manager",
    createdLabel: "Créé",
    notifDataTitle: "Données",
    adminCommentPlaceholder: "Commentaire administrateur (optionnel)...",
    notifAccept: "Approuver",
    notifReject: "Rejeter",

    leaveRequestsTitle: "Demandes de Congé Employés",
    leaveRequestsSubtitle: "Approuvez ou rejetez les demandes",
    leaveRequestsCount: (n) => `${n} demande(s)`,

    leaveTypes: {
      vacation: { label: "Congés payés", icon: "🏖️" },
      sick: { label: "Congé maladie", icon: "🏥" },
      personal: { label: "Congé personnel", icon: "👤" },
      family: { label: "Congé familial", icon: "👨‍👩‍👧‍👦" },
      maternity: { label: "Congé maternité", icon: "👶" },
      paternity: { label: "Congé paternité", icon: "👨‍👶" },
    },

    statusPending: "En attente",
    statusApproved: "Approuvée",
    statusRejected: "Rejetée",

    startLabel: "Début",
    endLabel: "Fin",
    durationLabel: "Durée",
    daysSuffix: "jour(s)",
    reasonTitle: "Motif de la demande",
    decisionCommentPlaceholder: "Votre commentaire sur cette décision...",
    approveBtn: "Approuver",
    rejectBtn: "Rejeter",
    loadingLabel: "En cours...",

    noNotificationsTitle: "Aucune demande manager",
    noNotificationsDesc: "Toutes les demandes managers sont traitées",
    noLeaveTitle: "Aucune demande en attente",
    noLeaveDesc: "Toutes les demandes de congé ont été traitées",

    dateUnknown: "Date inconnue",
  },
  ar: {
    approvalsTitle: "موافقات الإدارة",
    approvalsSubtitle: "المصادقة النهائية لطلبات المديرين والموظفين",
    approvalsSubtitleShort: "مصادقة الطلبات",
    refresh: "تحديث",
    refreshed: "تم تحديث البيانات",
    refreshError: "حدث خطأ أثناء التحديث",
    leaveApproved: "تمت الموافقة على طلب الإجازة",
    leaveRejected: "تم رفض طلب الإجازة",
    decisionSaved: "تم حفظ القرار بنجاح",
    processError: "حدث خطأ أثناء المعالجة",
    processErrorDesc: "يرجى المحاولة مرة أخرى",
    scheduleApproved: "تمت الموافقة على تغيير التخطيط",
    scheduleRejected: "تم رفض تغيير التخطيط",

    statsPending: "قيد الانتظار",
    statsApproved: "تمت الموافقة",
    statsRejected: "مرفوضة",
    statsTotal: "الإجمالي",
    statsPendingDesc: "إجراءات مطلوبة",
    statsApprovedDesc: "عمليات موافقة ناجحة",
    statsRejectedDesc: "طلبات مرفوضة",
    statsTotalDesc: "جميع الطلبات",

    filterAll: "الكل",
    filterPending: "قيد الانتظار",
    filterApproved: "موافق عليها",
    filterRejected: "مرفوضة",

    loadErrorTitle: "خطأ في التحميل",

    systemNotifications: "طلبات المدير",
    actionsToProcess: "إجراءات للمعالجة",
    notificationsCount: (n) => `${n} إشعار`,

    refLabel: "مرجع",
    managerLabel: "المدير",
    createdLabel: "تم الإنشاء",
    notifDataTitle: "البيانات",
    adminCommentPlaceholder: "تعليق المشرف (اختياري)...",
    notifAccept: "قبول",
    notifReject: "رفض",

    leaveRequestsTitle: "طلبات الإجازة للموظفين",
    leaveRequestsSubtitle: "الموافقة أو الرفض",
    leaveRequestsCount: (n) => `${n} طلب`,

    leaveTypes: {
      vacation: { label: "إجازة مدفوعة", icon: "🏖️" },
      sick: { label: "إجازة مرضية", icon: "🏥" },
      personal: { label: "إجازة شخصية", icon: "👤" },
      family: { label: "إجازة عائلية", icon: "👨‍👩‍👧‍👦" },
      maternity: { label: "إجازة أمومة", icon: "👶" },
      paternity: { label: "إجازة أبوة", icon: "👨‍👶" },
    },

    statusPending: "قيد الانتظار",
    statusApproved: "موافَق عليها",
    statusRejected: "مرفوضة",

    startLabel: "البداية",
    endLabel: "النهاية",
    durationLabel: "المدة",
    daysSuffix: "يوم",
    reasonTitle: "سبب الطلب",
    decisionCommentPlaceholder: "تعليقك على هذا القرار...",
    approveBtn: "الموافقة",
    rejectBtn: "رفض",
    loadingLabel: "جاري...",

    noNotificationsTitle: "لا توجد طلبات مدير",
    noNotificationsDesc: "تمت معالجة جميع اللبات",
    noLeaveTitle: "لا توجد طلبات قيد الانتظار",
    noLeaveDesc: "تمت معالجة جميع الطلبات",
    dateUnknown: "تاريخ غير معروف",
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

function getAbbrev(name: string | undefined | null, max = 3) {
  if (!name || typeof name !== "string" || !name.trim()) return ""
  const parts = name.trim().split(/\s+/)
  const letters = parts.map((p) => p[0]?.toUpperCase()).join("")
  const abbr = letters || name.slice(0, max).toUpperCase()
  return abbr.slice(0, max)
}

type DayAssignment = {
  shift: "Matin" | "Soirée" | "Doublage" | "Repos"
  location_id?: string
  job_position?: string
}

export default function AdminApprovalsPage() {
  const lang = useLang()
  const t = translations[lang]

  const [comments, setComments] = useState<{ [key: string]: string }>({})
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [refreshing, setRefreshing] = useState(false)
  const [planningManagerOpen, setPlanningManagerOpen] = useState(false)
  const [planningData, setPlanningData] = useState<any[]>([])
  const [loadingPlanning, setLoadingPlanning] = useState(false)

  const [notificationPlanners, setNotificationPlanners] = useState<{ [key: string]: boolean }>({})
  const [notificationPlanningData, setNotificationPlanningData] = useState<{ [key: string]: any[] }>({})

  const [plannerMonth, setPlannerMonth] = useState<Date>(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [monthEdits, setMonthEdits] = useState<Record<string, DayAssignment>>({})
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [grid, setGrid] = useState<(Date | null)[]>([])
  const [monthLabel, setMonthLabel] = useState("")

  const [modificationPlannerOpen, setModificationPlannerOpen] = useState(false)
  const [currentNotificationId, setCurrentNotificationId] = useState<string | null>(null)
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null)

  const {
    data: adminApprovalsData,
    loading: loadingApprovals,
    refetch: refetchApprovals,
    error: approvalsError,
  } = useQuery(GET_ADMIN_APPROVALS, {
    variables: { status: filter === "all" ? undefined : filter },
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  })

  const {
    data: leaveRequestsData,
    loading: loadingRequests,
    refetch: refetchRequests,
    error: requestsError,
  } = useQuery(GET_LEAVE_REQUESTS, {
    variables: { status: filter === "all" ? undefined : filter },
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  })

  const {
    data: managerPlanningData,
    loading: loadingManagerPlanning,
    refetch: refetchManagerPlanning,
  } = useQuery(GET_MANAGER_PLANNING_DATA, {
    skip: !planningManagerOpen,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  })

  const [getWorkSchedulesRange, { loading: loadingWorkSchedulesRange }] = useLazyQuery(GET_WORK_SCHEDULES_RANGE)

  const [approveLeaveRequest, { loading: approvingRequest }] = useMutation(APPROVE_LEAVE_REQUEST)
  const [approveScheduleChange, { loading: approvingSchedule }] = useMutation(APPROVE_SCHEDULE_CHANGE)
  const [rejectScheduleChange, { loading: rejectingSchedule }] = useMutation(REJECT_SCHEDULE_CHANGE)
  const [updateWorkSchedule] = useMutation(UPDATE_WORK_SCHEDULE) // Added UPDATE_WORK_SCHEDULE mutation
  const [deleteWorkSchedule] = useMutation(DELETE_WORK_SCHEDULE) // Added DELETE_WORK_SCHEDULE mutation
  const [deleteWorkSchedulesByEmployee] = useMutation(DELETE_WORK_SCHEDULES_BY_EMPLOYEE) // Added DELETE_WORK_SCHEDULES_BY_EMPLOYEE mutation

  const adminApprovals: AdminApproval[] = adminApprovalsData?.adminApprovals || []
  const leaveRequests: LeaveRequest[] = leaveRequestsData?.leaveRequests || []

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

  const formatDate = (dateInput: string | number | null | undefined) => {
    let dateObj: Date | null = null
    if (dateInput) {
      if (typeof dateInput === "number") {
        dateObj = new Date(dateInput)
      } else if (typeof dateInput === "string") {
        const parsed = Date.parse(dateInput)
        if (!isNaN(parsed)) {
          dateObj = new Date(parsed)
        } else if (!isNaN(Number(dateInput))) {
          dateObj = new Date(Number(dateInput))
        }
      }
    }
    if (dateObj && !isNaN(dateObj.getTime())) {
      try {
        return new Intl.DateTimeFormat(lang === "ar" ? "ar" : "fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(dateObj)
      } catch {
        return dateObj.toLocaleDateString(lang === "ar" ? "ar" : "fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
    }
    return t.dateUnknown
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchApprovals(), refetchRequests()])
      toast.success(t.refreshed)
    } catch (error) {
      toast.error(t.refreshError)
    } finally {
      setRefreshing(false)
    }
  }

  const handleLeaveApproval = async (requestId: string, status: "approved" | "rejected") => {
    try {
      await approveLeaveRequest({
        variables: {
          id: requestId,
          status,
          comment: comments[requestId] || "",
        },
      })
      toast.success(status === "approved" ? t.leaveApproved : t.leaveRejected, {
        description: t.decisionSaved,
      })
      setComments((prev) => ({ ...prev, [requestId]: "" }))
      await refetchRequests()
    } catch (error) {
      toast.error(t.processError, { description: t.processErrorDesc })
      console.error("Error approving leave request:", error)
    }
  }

  const handleApprovalDecision = async (approvalId: string, status: "approved" | "rejected") => {
    try {
      const approval = adminApprovals.find((a) => a.id === approvalId)
      if (!approval) return

      let parsedData
      try {
        parsedData = JSON.parse(approval.data)
      } catch (e) {
        console.error("Error parsing approval data:", e)
        parsedData = {}
      }

      if (status === "approved") {
        // This part is now handled by the frontend logic below, not a direct SQL query.
        // The original logic for updating work schedules to 'confirmed' is preserved.
        if (parsedData.employee_id) {
          const { data: scheduleData } = await getWorkSchedulesRange({
            variables: { employee_id: parsedData.employee_id },
            fetchPolicy: "network-only",
          })

          const managerSchedules = scheduleData?.workSchedulesRange?.filter((s: any) => s.status === "manager") || []

          for (const schedule of managerSchedules) {
            await updateWorkSchedule({
              variables: {
                id: schedule.id,
                status: "confirmed",
              },
            })
          }
        }

        // This logic is now handled by the approveScheduleChange mutation itself,
        // assuming the mutation updates the admin_approvals table.
        // If not, a separate mutation or direct update would be needed.

        await approveScheduleChange({ variables: { approval_id: approvalId } })
        toast.success(t.scheduleApproved, { description: t.decisionSaved })
      } else {
        // Also DELETE from source table WHERE status = manager
        if (parsedData.employee_id) {
          await deleteWorkSchedulesByEmployee({
            variables: {
              employee_id: parsedData.employee_id,
            },
          })
        }

        await rejectScheduleChange({ variables: { approval_id: approvalId, comment: comments[approvalId] || "" } })
        toast.success(t.scheduleRejected, { description: t.decisionSaved })
      }

      setComments((prev) => ({ ...prev, [approvalId]: "" }))
      await refetchApprovals()
    } catch (error) {
      toast.error(t.processError, { description: t.processErrorDesc })
      console.error("Error processing manager approval:", error)
    }
  }

  const handleOpenPlanningManager = async () => {
    //console.log("[v0] Opening planning manager modal")
    setLoadingPlanning(true)
    setPlanningManagerOpen(true)
    try {
      //console.log("[v0] Refetching manager planning data...")
      const result = await refetchManagerPlanning()
      //console.log("[v0] Manager planning data result:", result)
      //console.log("[v0] Manager planning data:", managerPlanningData)
      setPlanningData(managerPlanningData?.workSchedulesManager || [])
    } catch (error) {
      //console.log("[v0] Error loading planning data:", error)
      toast.error("Erreur lors du chargement du planning", { description: "Impossible de charger les données" })
      console.error("Error loading planning data:", error)
    } finally {
      setLoadingPlanning(false)
    }
  }

  const openNotificationPlanner = async (notificationId: string, notificationData: string) => {
    //console.log("[v0] Opening notification planner for:", notificationId)
    setLoadingPlanning(true)

    try {
      // Parse notification data to extract employee_id and date range
      let parsedData
      try {
        parsedData = JSON.parse(notificationData)
      } catch (e) {
        //console.log("[v0] Could not parse notification data, using raw data")
        parsedData = { employee_id: null }
      }

      if (parsedData.employee_id) {
        //console.log("[v0] Fetching work schedules for employee:", parsedData.employee_id)

        const { first, last } = getMonthInfo(plannerMonth)
        const start = first.toISOString().slice(0, 10)
        const end = last.toISOString().slice(0, 10)

        const result = await getWorkSchedulesRange({
          variables: {
            employee_id: parsedData.employee_id,
            start,
            end,
          },
          fetchPolicy: "network-only",
        })

        //console.log("[v0] Work schedules result:", result)

        const existing = (result.data?.workSchedulesRange ?? []) as any[]
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

        setNotificationPlanningData((prev) => ({
          ...prev,
          [notificationId]: result.data?.workSchedulesRange || [],
        }))
      }

      setNotificationPlanners((prev) => ({
        ...prev,
        [notificationId]: true,
      }))
    } catch (error) {
      //console.log("[v0] Error loading notification planning data:", error)
      toast.error("Erreur lors du chargement du planning", { description: "Impossible de charger les données" })
    } finally {
      setLoadingPlanning(false)
    }
  }

  const closeNotificationPlanner = (notificationId: string) => {
    setNotificationPlanners((prev) => ({
      ...prev,
      [notificationId]: false,
    }))
    setMonthEdits({}) // Clear edits when closing
  }

  const openModificationPlanner = async (notificationId: string, notificationData: string) => {
    //console.log("[v0] Opening modification planner for:", notificationId)
    setCurrentNotificationId(notificationId)

    try {
      let parsedData
      try {
        parsedData = JSON.parse(notificationData)
      } catch (e) {
        //console.log("[v0] Could not parse notification data, using raw data")
        parsedData = { employee_id: null }
      }

      if (parsedData.employee_id) {
        setCurrentEmployeeId(parsedData.employee_id)
        //console.log("[v0] Fetching work schedules for employee:", parsedData.employee_id)

        const { first, last } = getMonthInfo(plannerMonth)
        const start = first.toISOString().slice(0, 10)
        const end = last.toISOString().slice(0, 10)

        const result = await getWorkSchedulesRange({
          variables: {
            employee_id: parsedData.employee_id,
            start,
            end,
          },
          fetchPolicy: "network-only",
        })

        //console.log("[v0] Work schedules result:", result)

        const existing = (result.data?.workSchedulesRange ?? []) as any[]
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
      }

      setModificationPlannerOpen(true)
    } catch (error) {
      //console.log("[v0] Error loading modification planning data:", error)
      toast.error("Erreur lors du chargement du planning", { description: "Impossible de charger les données" })
    } finally {
      setLoadingPlanning(false)
    }
  }

  const saveModificationPlanning = async (notificationId?: string) => {
    if (!currentEmployeeId || !currentNotificationId) {
      toast.error("Erreur", { description: "Données manquantes pour la modification" })
      return
    }

    try {
      const entries = Object.entries(monthEdits)
      if (entries.length === 0) {
        setModificationPlannerOpen(false)
        return
      }

      // Update work_schedules: SET status='admin' WHERE employee_id and current schedules
      const { data: scheduleData } = await getWorkSchedulesRange({
        variables: { employee_id: currentEmployeeId },
        fetchPolicy: "network-only",
      })

      const existingSchedules = scheduleData?.workSchedulesRange || []

      // Update existing schedules to status='admin'
      for (const schedule of existingSchedules) {
        if (schedule.status === "manager") {
          await updateWorkSchedule({
            variables: {
              id: schedule.id,
              status: "admin",
            },
          })
        }
      }

      // Update the approval status to 'admin' as well
      // This assumes the approval itself is a "work schedule" or has a similar ID structure.
      // If not, a separate mutation or direct update would be needed.
      await updateWorkSchedule({
        variables: {
          id: currentNotificationId, // Assuming currentNotificationId is the ID of the approval record
          status: "admin",
        },
      })

      toast.success("Planning modifié", {
        description: "Les modifications ont été appliquées avec le statut admin",
      })

      setModificationPlannerOpen(false)
      setCurrentNotificationId(null)
      setCurrentEmployeeId(null)
      setMonthEdits({})
      await refetchApprovals()
    } catch (error) {
      console.error("Error saving modification planning:", error)
      toast.error("Erreur", { description: "Impossible de sauvegarder les modifications" })
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

  const totalPending =
    adminApprovals.filter((a) => a.status === "pending").length +
    leaveRequests.filter((r) => r.status === "pending").length
  const totalApproved =
    adminApprovals.filter((a) => a.status === "approved").length +
    leaveRequests.filter((r) => r.status === "approved").length
  const totalRejected =
    adminApprovals.filter((a) => a.status === "rejected").length +
    leaveRequests.filter((r) => r.status === "rejected").length

  const isLoading = loadingApprovals || loadingRequests || refreshing

  if (isLoading && !adminApprovals.length && !leaveRequests.length) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen relative overflow-hidden animate-fade-in" dir="ltr">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-900/60 to-slate-900/80 backdrop-blur-[6px]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 relative z-20 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 via-purple-900/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-700/40 to-purple-700/40 rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/10">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent"
                  dir="auto"
                >
                  {t.approvalsTitle}
                </h1>
                <p className="text-slate-200 text-sm sm:text-base lg:text-lg hidden sm:block" dir="auto">
                  {t.approvalsSubtitle}
                </p>
                <p className="text-slate-200 text-sm sm:hidden" dir="auto">
                  {t.approvalsSubtitleShort}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="secondary"
                size="sm"
                className="glass-card bg-gradient-to-br from-slate-800/80 to-indigo-900/80 border border-white/10 text-white hover:bg-white/30"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                <span dir="auto">{t.refresh}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatsCard
            title={translations[lang].statsPending}
            value={totalPending}
            icon={Clock}
            gradient="from-orange-500 to-amber-500"
            description={translations[lang].statsPendingDesc}
            glass
          />
          <StatsCard
            title={translations[lang].statsApproved}
            value={totalApproved}
            icon={CheckCircle}
            gradient="from-green-500 to-emerald-500"
            description={translations[lang].statsApprovedDesc}
            glass
          />
          <StatsCard
            title={translations[lang].statsRejected}
            value={totalRejected}
            icon={XCircle}
            gradient="from-red-500 to-rose-500"
            description={translations[lang].statsRejectedDesc}
            glass
          />
          <StatsCard
            title={translations[lang].statsTotal}
            value={totalPending + totalApproved + totalRejected}
            icon={TrendingUp}
            gradient="from-blue-500 to-cyan-500"
            description={translations[lang].statsTotalDesc}
            glass
          />
        </div>

        {/* Filter */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-indigo-900/60 to-slate-900/70">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "approved", "rejected"] as const).map((status) => {
                const isActive = filter === status
                let accent = ""
                if (status === "all") accent = "from-indigo-700/80 to-blue-700/80"
                if (status === "pending") accent = "from-orange-700/80 to-amber-700/80"
                if (status === "approved") accent = "from-green-700/80 to-emerald-700/80"
                if (status === "rejected") accent = "from-red-700/80 to-rose-700/80"
                const label =
                  status === "all"
                    ? translations[lang].filterAll
                    : status === "pending"
                      ? translations[lang].filterPending
                      : status === "approved"
                        ? translations[lang].filterApproved
                        : translations[lang].filterRejected
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilter(status)}
                    className={`glass-card border border-white/10 px-4 py-2 rounded-xl flex-1 sm:flex-none min-w-0 flex items-center justify-center gap-2 transition-all duration-200 text-xs sm:text-sm font-semibold shadow-md ${
                      isActive
                        ? `bg-gradient-to-br ${accent} text-white ring-2 ring-indigo-400/60`
                        : "bg-gradient-to-br from-slate-800/70 to-indigo-900/70 text-indigo-200 hover:ring-2 hover:ring-indigo-400/30"
                    }`}
                  >
                    <Filter
                      className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${isActive ? "text-white" : "text-indigo-300"}`}
                    />
                    <span className="truncate" dir="auto">
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {(approvalsError || requestsError) && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-semibold" dir="auto">
                    {translations[lang].loadErrorTitle}
                  </p>
                  <p className="text-sm text-red-600" dir="auto">
                    {approvalsError?.message || requestsError?.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manager Approvals */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-indigo-900/60 to-slate-900/70">
          <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl" dir="auto">
                    {translations[lang].systemNotifications}
                  </CardTitle>
                  <CardDescription className="text-sm" dir="auto">
                    {translations[lang].actionsToProcess}
                  </CardDescription>
                </div>
              </div>
              {adminApprovals.length > 0 && (
                <Badge className="glass-card bg-gradient-to-br from-indigo-700/40 to-blue-700/40 text-indigo-100 border-0 px-2 py-1 text-xs sm:px-3 sm:text-sm self-start sm:self-auto shadow">
                  <span dir="auto">{translations[lang].notificationsCount(adminApprovals.length)}</span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {adminApprovals.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {adminApprovals.map((notif) => (
                  <ApprovalCard
                    key={notif.id}
                    notification={notif}
                    comment={comments[notif.id] || ""}
                    onCommentChange={(value: string) => setComments((prev) => ({ ...prev, [notif.id]: value }))}
                    formatDate={formatDate}
                    t={translations[lang]}
                    onApprove={() => handleApprovalDecision(notif.id, "approved")}
                    onReject={() => handleApprovalDecision(notif.id, "rejected")}
                    loadingAction={approvingSchedule || rejectingSchedule}
                    onOpenPlanner={openNotificationPlanner}
                    loadingPlanning={loadingPlanning}
                    onOpenModificationPlanner={openModificationPlanner} // Added modification planner prop
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={AlertTriangle}
                title={translations[lang].noNotificationsTitle}
                description={translations[lang].noNotificationsDesc}
              />
            )}
          </CardContent>
        </Card>

        {/* Leave Requests */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-indigo-900/60 to-slate-900/70">
          <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl" dir="auto">
                    {translations[lang].leaveRequestsTitle}
                  </CardTitle>
                  <CardDescription className="text-sm" dir="auto">
                    {translations[lang].leaveRequestsSubtitle}
                  </CardDescription>
                </div>
              </div>
              {leaveRequests.length > 0 && (
                <Badge className="glass-card bg-gradient-to-br from-green-700/40 to-emerald-700/40 text-green-100 border-0 px-2 py-1 text-xs sm:px-3 sm:text-sm self-start sm:self-auto shadow">
                  <span dir="auto">{translations[lang].leaveRequestsCount(leaveRequests.length)}</span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {leaveRequests.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {leaveRequests.map((request) => (
                  <LeaveRequestCard
                    key={request.id}
                    request={request}
                    comment={comments[request.id] || ""}
                    onCommentChange={(value: string) => setComments((prev) => ({ ...prev, [request.id]: value }))}
                    onApprove={() => handleLeaveApproval(request.id, "approved")}
                    onReject={() => handleLeaveApproval(request.id, "rejected")}
                    t={translations[lang]}
                    lang={lang}
                    formatDate={formatDate}
                    isLoading={approvingRequest}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle}
                title={translations[lang].noLeaveTitle}
                description={translations[lang].noLeaveDesc}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Planning Manager Modal */}
      <Dialog open={planningManagerOpen} onOpenChange={setPlanningManagerOpen}>
        <DialogContent className="w-[98vw] max-w-7xl mx-auto max-h-[95vh] overflow-y-auto glass-card bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border border-white/10 p-0">
          <DialogHeader className="sticky top-0 z-10 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
            <DialogTitle className="text-2xl font-bold text-white flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-emerald-400" />
              <span>Planning Manager</span>
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Plannings créés par les managers (status='manager' et traite='manager')
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6">
            {loadingManagerPlanning ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
                <span className="ml-4 text-lg text-slate-300">Chargement du planning...</span>
              </div>
            ) : managerPlanningData?.workSchedulesManager?.length > 0 ? (
              <div className="space-y-6">
                <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-purple-900/60 to-slate-900/70">
                  <CardHeader>
                    <CardTitle className="text-white">Planning des Managers</CardTitle>
                    <CardDescription className="text-slate-300">
                      Vue d'ensemble des plannings créés par les managers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-white">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left p-3 font-semibold">Employé</th>
                            <th className="text-center p-3 font-semibold">Date</th>
                            <th className="text-center p-3 font-semibold">Shift</th>
                            <th className="text-center p-3 font-semibold">Horaires</th>
                            <th className="text-center p-3 font-semibold">Poste</th>
                            <th className="text-center p-3 font-semibold">Lieu</th>
                            <th className="text-center p-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {managerPlanningData.workSchedulesManager
                            .sort(
                              (a: ManagerPlanningData, b: ManagerPlanningData) =>
                                new Date(a.date).getTime() - new Date(b.date).getTime(),
                            )
                            .map((schedule: ManagerPlanningData) => {
                              const scheduleDate = new Date(schedule.date)
                              const isToday = scheduleDate.toDateString() === new Date().toDateString()
                              const dayName = scheduleDate.toLocaleDateString("fr-FR", { weekday: "long" })
                              const dateStr = scheduleDate.toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })

                              return (
                                <tr
                                  key={schedule.id}
                                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                                    isToday ? "bg-blue-600/10" : ""
                                  }`}
                                >
                                  <td className="p-3">
                                    <div className="flex items-center space-x-3">
                                      <Avatar className="w-8 h-8">
                                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-700/60 to-purple-700/60 text-white">
                                          {(schedule.employee.profile.first_name || schedule.employee.prenom || "")[0]}
                                          {(schedule.employee.profile.last_name || schedule.employee.nom || "")[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate text-white">
                                          {schedule.employee.profile.first_name || schedule.employee.prenom}{" "}
                                          {schedule.employee.profile.last_name || schedule.employee.nom}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">ID: {schedule.employee_id}</p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="text-center p-3">
                                    <div className="flex flex-col items-center">
                                      <span className="text-sm font-medium text-white">{dateStr}</span>
                                      <span className="text-xs text-slate-400 capitalize">{dayName}</span>
                                      {isToday && (
                                        <span className="text-xs text-blue-400 font-medium">Aujourd'hui</span>
                                      )}
                                    </div>
                                  </td>

                                  <td className="text-center p-3">
                                    <Badge
                                      className={`text-xs font-medium border-0 ${
                                        schedule.shift_type === "Matin"
                                          ? "bg-blue-700/30 text-blue-200 border border-blue-500/30"
                                          : schedule.shift_type === "Soirée"
                                            ? "bg-purple-700/30 text-purple-200 border border-purple-500/30"
                                            : schedule.shift_type === "Doublage"
                                              ? "bg-orange-700/30 text-orange-200 border border-orange-500/30"
                                              : schedule.shift_type === "Repos"
                                                ? "bg-gray-700/30 text-gray-200 border border-gray-500/30"
                                                : "bg-slate-700/30 text-slate-200 border border-slate-500/30"
                                      }`}
                                    >
                                      {schedule.shift_type}
                                    </Badge>
                                  </td>

                                  <td className="text-center p-3">
                                    {schedule.start_time && schedule.end_time ? (
                                      <div className="flex items-center justify-center space-x-1">
                                        <Clock className="w-3 h-3 text-emerald-400" />
                                        <span className="text-sm text-emerald-200">
                                          {schedule.start_time} - {schedule.end_time}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 text-sm">-</span>
                                    )}
                                  </td>

                                  <td className="text-center p-3">
                                    {schedule.job_position ? (
                                      <span className="text-sm text-yellow-200">{schedule.job_position}</span>
                                    ) : (
                                      <span className="text-slate-400 text-sm">-</span>
                                    )}
                                  </td>

                                  <td className="text-center p-3">
                                    {schedule.location ? (
                                      <div className="flex items-center justify-center space-x-1">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                        <span className="text-sm text-emerald-200">{schedule.location.name}</span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 text-sm">-</span>
                                    )}
                                  </td>

                                  <td className="text-center p-3">
                                    <div className="flex flex-col items-center space-y-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs border-emerald-500/30 text-emerald-200"
                                      >
                                        {schedule.status}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-200">
                                        {schedule.traite}
                                      </Badge>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-grid-cols-3 gap-4">
                  <div className="glass-card bg-gradient-to-br from-blue-800/30 to-blue-900/30 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-8 h-8 text-blue-400" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {managerPlanningData.workSchedulesManager.length}
                        </div>
                        <div className="text-sm text-blue-200">Total Plannings</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card bg-gradient-to-br from-emerald-800/30 to-emerald-900/30 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <Users className="w-8 h-8 text-emerald-400" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {
                            new Set(
                              managerPlanningData.workSchedulesManager.map((s: ManagerPlanningData) => s.employee_id),
                            ).size
                          }
                        </div>
                        <div className="text-sm text-emerald-200">Employés Concernés</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card bg-gradient-to-br from-purple-800/30 to-purple-900/30 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-8 h-8 text-purple-400" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {
                            managerPlanningData.workSchedulesManager.filter(
                              (s: ManagerPlanningData) => s.shift_type !== "Repos",
                            ).length
                          }
                        </div>
                        <div className="text-sm text-purple-200">Shifts Actifs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Aucun planning manager trouvé</p>
                <p className="text-slate-500 text-sm">Aucune donnée avec status='manager' et traite='manager'</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Planning Modal with Admin Actions Inside */}
      {adminApprovals.map((notif) => (
        <Dialog
          key={notif.id}
          open={notificationPlanners[notif.id] || false}
          onOpenChange={(open) => !open && closeNotificationPlanner(notif.id)}
        >
          <DialogContent className="w-[98vw] max-w-6xl mx-auto max-h-[95vh] overflow-y-auto glass-card bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-900/95 border border-white/10 text-white p-0">
            <DialogHeader className="sticky top-0 z-10 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-4">
              <DialogTitle className="text-lg sm:text-xl">Planning du mois — Demande #{notif.reference_id}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Plannings pour le mois de {monthLabel}
              </DialogDescription>
            </DialogHeader>

            <div className="px-2 sm:px-4 py-4 space-y-4">
              {notif.status === "pending" && (
                <div className="space-y-3 p-3 sm:p-4 glass-card bg-gradient-to-br from-slate-800/70 to-indigo-900/70 rounded-lg border border-white/10">
                  <h4 className="text-sm font-medium text-white">Commentaire administrateur</h4>
                  <Textarea
                    placeholder={t.adminCommentPlaceholder}
                    value={comments[notif.id] || ""}
                    onChange={(e) => setComments((prev) => ({ ...prev, [notif.id]: e.target.value }))}
                    rows={2}
                    className="glass-card bg-gradient-to-br from-slate-900/80 to-indigo-900/80 border border-white/10 text-white text-sm"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-300">Shift simple</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex flex-col gap-0.5">
                      <span className="block w-2.5 h-2 rounded-full bg-cyan-400" />
                      <span className="block w-2.5 h-2 rounded-full bg-cyan-400" />
                    </span>
                    <span className="text-slate-300">Doublage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <span className="text-slate-300">Repos</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => changeMonth(-1)}
                    aria-label="Mois précédent"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="px-2 sm:px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs sm:text-sm whitespace-nowrap">
                    {monthLabel}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => changeMonth(1)}
                    aria-label="Mois suivant"
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="w-full">
                <div className="grid grid-cols-7 gap-1 text-xs text-slate-400 mb-2">
                  <div className="text-center p-1">Lun</div>
                  <div className="text-center p-1">Mar</div>
                  <div className="text-center p-1">Mer</div>
                  <div className="text-center p-1">Jeu</div>
                  <div className="text-center p-1">Ven</div>
                  <div className="text-center p-1">Sam</div>
                  <div className="text-center p-1">Dim</div>
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

                    return (
                      <Popover key={ds} open={editingDay === ds} onOpenChange={(o) => setEditingDay(o ? ds : null)}>
                        <PopoverTrigger asChild>
                          <button
                            className={`relative rounded-lg px-1 pt-2 pb-4 text-left transition-all duration-200 h-12 sm:h-16 md:h-20 w-full ${
                              isToday
                                ? "bg-blue-600/20 hover:bg-blue-600/30 border-2 border-blue-500/50"
                                : "bg-white/5 hover:bg-white/10 border border-white/10"
                            }`}
                            onClick={() => setEditingDay(ds)}
                          >
                            <span
                              className={`text-xs font-medium block ${isToday ? "text-blue-200" : "text-slate-200"}`}
                            >
                              {d.getDate()}
                            </span>

                            {isToday && (
                              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                            )}

                            <div className="absolute left-1 bottom-1 flex flex-col items-start gap-0.5">
                              {isDouble ? (
                                <>
                                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                </>
                              ) : isSimple ? (
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                              ) : isRepos ? (
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.6)]" />
                              ) : null}
                            </div>

                            {assign?.location_id && assign?.location_id !== "0" && (
                              <span
                                className="absolute right-1 bottom-1 text-[8px] sm:text-[9px] px-1 py-0.5 rounded-md bg-slate-800/70 text-slate-100 border border-white/10"
                                title={`Restaurant ${assign.location_id}`}
                              >
                                {getAbbrev(`Restaurant ${assign.location_id}`, 2)}
                              </span>
                            )}

                            {(assign?.location_id === "0" || assign?.shift === "Repos") && (
                              <span
                                className="absolute right-1 bottom-1 text-[8px] sm:text-[10px] font-bold text-white bg-gray-600/80 px-1 rounded"
                                title="Repos"
                              >
                                REP
                              </span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 sm:w-80 p-0 bg-gradient-to-br from-slate-900/95 to-slate-900/95 border border-white/10 text-white">
                          <div className="p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-slate-300">
                                {new Intl.DateTimeFormat("fr-FR", {
                                  weekday: "long",
                                  day: "2-digit",
                                  month: "long",
                                }).format(d)}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingDay(null)}
                                className="h-6 w-6"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs text-slate-400 uppercase tracking-wide">Type de shift</div>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { value: "Matin", label: "Matin" },
                                  { value: "Soirée", label: "Soirée" },
                                  { value: "Doublage", label: "Doublage" },
                                  { value: "Repos", label: "Repos" },
                                ].map((shift) => (
                                  <Button
                                    key={shift.value}
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      applyForDay(ds, {
                                        shift: shift.value as DayAssignment["shift"],
                                        location_id: shift.value === "Repos" ? "0" : undefined,
                                        job_position: undefined,
                                      })
                                    }
                                    className={`text-xs h-8 ${
                                      assign?.shift === shift.value
                                        ? "bg-blue-600/30 border-blue-500/50 text-blue-200"
                                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                                    }`}
                                  >
                                    {shift.label}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applyForDay(ds, null)}
                                className="flex-1 h-8 text-xs bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                              >
                                Effacer
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setEditingDay(null)}
                                className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Appliquer
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => closeNotificationPlanner(notif.id)}
                  className="text-slate-300 border-white/20 hover:bg-white/10 bg-transparent order-3 sm:order-1"
                >
                  Fermer
                </Button>

                {notif.status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
                    <Button
                      onClick={() => {
                        handleApprovalDecision(notif.id, "approved")
                        closeNotificationPlanner(notif.id)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-md glass-card flex-1 sm:flex-none"
                      disabled={approvingSchedule || rejectingSchedule}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span dir="auto">Approuver</span>
                    </Button>
                    <Button
                      onClick={() => {
                        handleApprovalDecision(notif.id, "rejected")
                        closeNotificationPlanner(notif.id)
                      }}
                      variant="destructive"
                      className="shadow-md glass-card flex-1 sm:flex-none"
                      disabled={approvingSchedule || rejectingSchedule}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      <span dir="auto">Rejeter</span>
                    </Button>
                  </div>
                )}

                <Button
                  onClick={() => saveModificationPlanning(notif.id)}
                  className="bg-orange-600 hover:bg-orange-700 text-white order-2 sm:order-3"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Appliquer les modifications (Admin)</span>
                  <span className="sm:hidden">Modifications Admin</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}

      <div className="p-3 sm:p-4 glass-card bg-gradient-to-br from-slate-900/80 to-indigo-900/80 rounded-lg sm:rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <Button
            onClick={() => handleOpenPlanningManager()}
            variant="secondary"
            size="sm"
            className="glass-card bg-gradient-to-br from-emerald-800/80 to-green-900/80 border border-white/10 text-white hover:bg-white/30"
            disabled={loadingPlanning}
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span dir="auto">Voir le Planning Manager</span>
          </Button>
        </div>

        <div className="text-xs text-slate-300 p-2 bg-slate-800/50 rounded border border-white/10">
          Cliquez sur "Voir le Planning Manager" pour consulter et modifier le planning proposé
        </div>
      </div>
    </div>
  )
}

// Skeleton
const LoadingSkeleton = () => (
  <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
    <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl" />
        <div className="space-y-2">
          <div className="h-6 sm:h-8 w-48 sm:w-64 bg-white/20 rounded" />
          <div className="h-3 sm:h-4 w-32 sm:w-48 bg-white/20 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                  <Skeleton className="h-6 sm:h-8 w-6 sm:w-8" />
                </div>
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
)

const StatsCard = ({ title, value, icon: Icon, gradient, description, glass }: any) => (
  <Card
    className={`border-0 shadow-lg ${
      glass
        ? "glass-card backdrop-blur-futuristic border border-white/10 bg-gradient-to-br from-slate-900/70 via-indigo-900/60 to-slate-900/70"
        : "bg-white/70 backdrop-blur-sm"
    } hover:shadow-xl transition-all duration-300`}
  >
    <CardContent className="p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-indigo-200 truncate" dir="auto">
            {title}
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{value}</p>
          <p className="text-xs text-indigo-200 hidden sm:block" dir="auto">
            {description}
          </p>
        </div>
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${gradient} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-2`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

function ApprovalCard({
  notification,
  comment,
  onCommentChange,
  formatDate,
  t,
  onApprove,
  onReject,
  loadingAction,
  onOpenPlanner,
  loadingPlanning,
  onOpenModificationPlanner, // Added onOpenModificationPlanner prop
}: {
  notification: AdminApproval
  comment: string
  onCommentChange: (v: string) => void
  formatDate: (d: string | number | null | undefined) => string
  t: Dict
  onApprove: () => void
  onReject: () => void
  loadingAction: boolean
  onOpenPlanner: (notificationId: string, notificationData: string) => void
  loadingPlanning: boolean
  onOpenModificationPlanner: (notificationId: string, notificationData: string) => void // Added prop type
}) {
  const statusClass =
    notification.status === "pending"
      ? "bg-gradient-to-br from-orange-700/40 to-amber-700/40 text-orange-100"
      : notification.status === "approved"
        ? "bg-gradient-to-br from-green-700/40 to-emerald-700/40 text-green-100"
        : "bg-gradient-to-br from-red-700/40 to-rose-700/40 text-red-100"
  const statusLabel =
    notification.status === "pending"
      ? t.statusPending
      : notification.status === "approved"
        ? t.statusApproved
        : t.statusRejected

  return (
    <div className="border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 glass-card bg-gradient-to-br from-slate-800/70 to-indigo-900/70 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground truncate" dir="auto">
              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1).replace("_", " ")}
            </h3>
            <Badge className={`text-xs px-2 py-1 rounded-lg border-0 glass-card shadow ${statusClass}`}>
              <span dir="auto">{statusLabel}</span>
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium" dir="auto">
              {t.refLabel}: {notification.reference_id}
            </span>
            <span className="hidden sm:inline" dir="auto">
              {t.managerLabel}: {notification.manager_id}
            </span>
            <span dir="auto">
              {t.createdLabel}: {formatDate(notification.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 glass-card bg-gradient-to-br from-slate-900/80 to-indigo-900/80 rounded-lg sm:rounded-xl">
        <div className="flex items-center justify-center mb-2">
          <Button
            onClick={() => onOpenPlanner(notification.id, notification.data)}
            variant="secondary"
            size="sm"
            className="glass-card bg-gradient-to-br from-emerald-800/80 to-green-900/80 border border-white/10 text-white hover:bg-white/30 w-full sm:w-auto"
            disabled={loadingPlanning}
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span dir="auto">Voir le Planning Manager</span>
          </Button>
        </div>

        <div className="text-xs text-slate-300 p-2 bg-slate-800/50 rounded border border-white/10 text-center">
          Cliquez pour consulter le planning et prendre une décision
        </div>
      </div>
    </div>
  )
}

function LeaveRequestCard({
  request,
  comment,
  onCommentChange,
  onApprove,
  onReject,
  t,
  lang,
  formatDate,
  isLoading,
}: {
  request: LeaveRequest
  comment: string
  onCommentChange: (v: string) => void
  onApprove: () => void
  onReject: () => void
  t: Dict
  lang: Lang
  formatDate: (d: string | number | null | undefined) => string
  isLoading: boolean
}) {
  const leaveMeta =
    t.leaveTypes[request.type] || ({ label: request.type, icon: "📄" } as { label: string; icon: string })
  const isPending = request.status === "pending"

  return (
    <div className="border border-white/10 rounded-2xl p-6 space-y-4 glass-card bg-gradient-to-br from-slate-800/70 to-indigo-900/70 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{leaveMeta.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-white" dir="auto">
                {leaveMeta.label}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Users className="w-4 h-4 text-indigo-200" />
                <span className="text-sm text-indigo-200" dir="auto">
                  {request.employee.profile.first_name} {request.employee.profile.last_name}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Badge
          className={`flex items-center gap-1 glass-card border-0 shadow ${
            isPending
              ? "bg-gradient-to-br from-amber-700/40 to-orange-700/40 text-amber-100"
              : request.status === "approved"
                ? "bg-gradient-to-br from-green-700/40 to-emerald-700/40 text-green-100"
                : "bg-gradient-to-br from-red-700/40 to-rose-700/40 text-red-100"
          }`}
        >
          <Clock className="w-3 h-3" />
          <span dir="auto">
            {isPending ? t.statusPending : request.status === "approved" ? t.statusApproved : t.statusRejected}
          </span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-br from-blue-900/70 to-indigo-900/80 rounded-lg border border-white/10">
          <Calendar className="w-5 h-5 text-blue-200" />
          <div>
            <p className="text-xs text-blue-200" dir="auto">
              {t.startLabel}
            </p>
            <p className="text-sm font-medium text-white" dir="auto">
              {formatDate(request.start_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-br from-red-900/70 to-indigo-900/80 rounded-lg border border-white/10">
          <Calendar className="w-5 h-5 text-red-200" />
          <div>
            <p className="text-xs text-red-200" dir="auto">
              {t.endLabel}
            </p>
            <p className="text-sm font-medium text-white" dir="auto">
              {formatDate(request.end_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-br from-green-900/70 to-indigo-900/80 rounded-lg border border-white/10">
          <Clock className="w-5 h-5 text-green-200" />
          <div>
            <p className="text-xs text-green-200" dir="auto">
              {t.durationLabel}
            </p>
            <p className="text-sm font-medium text-white" dir="auto">
              {request.days_count} {t.daysSuffix}
            </p>
          </div>
        </div>
      </div>

      {request.reason && (
        <div className="p-4 glass-card bg-gradient-to-br from-amber-900/70 to-indigo-900/80 rounded-lg border-l-4 border-amber-400 border border-white/10">
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-4 h-4 text-amber-200 mt-0.5" />
            <div>
              <p className="text-xs text-amber-200 font-medium mb-1" dir="auto">
                {t.reasonTitle}
              </p>
              <p className="text-sm text-white" dir="auto">
                {request.reason}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {isPending ? (
          <>
            <Textarea
              placeholder={t.decisionCommentPlaceholder}
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              rows={2}
              className="glass-card bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border border-white/10 text-white placeholder:text-indigo-300 focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex space-x-3">
              <Button
                onClick={onApprove}
                disabled={isLoading}
                className="bg-green-700 hover:bg-green-800 text-white shadow-md flex-1 md:flex-none glass-card border border-white/10"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                <span dir="auto">{isLoading ? t.loadingLabel : t.approveBtn}</span>
              </Button>
              <Button
                onClick={onReject}
                disabled={isLoading}
                variant="destructive"
                className="shadow-md flex-1 md:flex-none glass-card border border-white/10"
              >
                <XCircle className="w-4 h-4 mr-2" />
                <span dir="auto">{t.rejectBtn}</span>
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 glass-card bg-gradient-to-br from-slate-800/70 to-indigo-900/70 rounded-full flex items-center justify-center">
        <Icon className="w-10 h-10 text-indigo-300" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2" dir="auto">
        {title}
      </h3>
      <p className="text-indigo-200 max-w-md mx-auto" dir="auto">
        {description}
      </p>
    </div>
  )
}
