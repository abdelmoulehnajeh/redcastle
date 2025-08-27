"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,

} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation } from "@apollo/client"
import {
  GET_EMPLOYEES,
  GET_LOCATIONS,
  GET_TIME_ENTRIES,
  GET_WORK_SCHEDULES_RANGE,
  GET_PAYROLL_PAYMENTS,
  PAY_SALARY,
} from "@/lib/graphql-queries"
import { toast } from "sonner"
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Search,
  Download,
  Calculator,
  CreditCard,
  Banknote,

  Menu,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface Employee {
  id: string
  nom: string
  prenom: string
  email: string
  job_title: string
  salaire: number
  prime: number
  avance: number
  infractions: number
  absence: number
  retard: number
  tenu_de_travail: number
  status: string
  price_h?: number
  location: { id: string; name: string } | null
}

interface Location {
  id: string
  name: string
}

type Lang = "fr" | "ar"

type Dict = {
  pageTitle: string
  pageSubtitle: string
  payrollMass: string
  payrollMassSub: string
  bonuses: string
  bonusesSub: string
  penalties: string
  penaltiesSub: string
  advances: string
  advancesSub: string
  filters: string
  searchPlaceholder: string
  restaurant: string
  allRestaurants: string
  month: string
  export: string
  tableTitle: string
  tableSubtitle: (m: string) => string
  colEmployee: string
  colRestaurant: string
  colBaseSalary: string
  colBonus: string
  colAdvance: string
  colPenalties: string
  colNetPay: string
  colStatus: string
  colActions: string
  notAssigned: string
  noneFound: string
  paid: string
  unpaid: string
  paidWith: (amount: string) => string
  calendarTitle: (name: string) => string
  calendarDesc: (m: string) => string
  legendSingle: string
  legendDouble: string
  legendOff: string
  close: string
  viewDetails: string
  prevMonth: string
  nextMonth: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    pageTitle: "Gestion Financière",
    pageSubtitle: "Salaires, primes, pénalités et avances",
    payrollMass: "Masse Salariale",
    payrollMassSub: "Total net à payer",
    bonuses: "Primes",
    bonusesSub: "Récompenses",
    penalties: "Pénalités",
    penaltiesSub: "Retards & absences",
    advances: "Avances",
    advancesSub: "À déduire",
    filters: "Filtres",
    searchPlaceholder: "Rechercher un employé...",
    restaurant: "Restaurant",
    allRestaurants: "Tous les restaurants",
    month: "Mois",
    export: "Export",
    tableTitle: "Gestion des Salaires",
    tableSubtitle: (m) => `Vue des salaires pour ${m}`,
    colEmployee: "Employé",
    colRestaurant: "Restaurant",
    colBaseSalary: "Salaire Base",
    colBonus: "Prime",
    colAdvance: "Avance",
    colPenalties: "Pénalités",
    colNetPay: "Net à Payer",
    colStatus: "Statut",
    colActions: "Actions",
    notAssigned: "Non assigné",
    noneFound: "Aucun employé trouvé",
    paid: "Payé",
    unpaid: "Non payé",
    paidWith: (amount) => `Payé • ${amount}`,
    calendarTitle: (name) => `Planning du mois — ${name}`,
    calendarDesc: (m) => `Points: 1 = shift simple, 2 = doublage. Mois affiché: ${m}`,
    legendSingle: "Shift simple",
    legendDouble: "Doublage",
    legendOff: "Repos / Non travaillé",
    close: "Fermer",
    viewDetails: "Voir",
    prevMonth: "Mois précédent",
    nextMonth: "Mois suivant",
  },
  ar: {
    pageTitle: "الإدارة المالية",
    pageSubtitle: "الرواتب، العلاوات، العقوبات والسلف",
    payrollMass: "كتلة الأجور",
    payrollMassSub: "صافي الإجمالي للدفع",
    bonuses: "العلاوات",
    bonusesSub: "مكافآت",
    penalties: "العقوبات",
    penaltiesSub: "تأخيرات وغيابات",
    advances: "السلف",
    advancesSub: "يتم خصمها",
    filters: "عوامل التصفية",
    searchPlaceholder: "ابحث عن موظف...",
    restaurant: "المطعم",
    allRestaurants: "جميع المطاعم",
    month: "الشهر",
    export: "تصدير",
    tableTitle: "إدارة الرواتب",
    tableSubtitle: (m) => `عرض الرواتب لشهر ${m}`,
    colEmployee: "الموظف",
    colRestaurant: "المطعم",
    colBaseSalary: "الراتب الأساسي",
    colBonus: "العلاوة",
    colAdvance: "السلفة",
    colPenalties: "العقوبات",
    colNetPay: "الصافي للدفع",
    colStatus: "الحالة",
    colActions: "إجراءات",
    notAssigned: "غير معيّن",
    noneFound: "لا يوجد موظفون",
    paid: "مدفوع",
    unpaid: "غير مدفوع",
    paidWith: (amount) => `مدفوع • ${amount}`,
    calendarTitle: (name) => `تقويم الشهر — ${name}`,
    calendarDesc: (m) => `النقاط: 1 = نوبة واحدة، 2 = مضاعفة. الشهر: ${m}`,
    legendSingle: "نوبة واحدة",
    legendDouble: "مضاعفة",
    legendOff: "راحة / غير عامل",
    close: "إغلاق",
    viewDetails: "عرض",
    prevMonth: "الشهر السابق",
    nextMonth: "الشهر التالي",
  },
}

function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("fr")
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("lang")
    if (stored === "ar" || stored === "fr") setLang(stored)
  }, [])
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.setAttribute("lang", lang)
    document.documentElement.setAttribute("dir", "ltr")
  }, [lang])
  return lang
}

// Helpers: month, calendar
function monthLabel(ym: string, locale: string) {
  try {
    const d = new Date(`${ym}-01T00:00:00`)
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(d)
  } catch {
    return ym
  }
}
function monthStartEnd(ym: string) {
  const start = new Date(`${ym}-01T00:00:00`)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  end.setDate(0)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    lastDay: end.getDate(),
  }
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

export default function AdminFinancePage() {
  const lang = useLang()
  const t = translations[lang]
  const locale = lang === "ar" ? "ar" : "fr-FR"

  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [openCalendarFor, setOpenCalendarFor] = useState<Employee | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const { data: employeesData, loading: employeesLoading, refetch: refetchEmployees } = useQuery(GET_EMPLOYEES)
  const { data: locationsData } = useQuery(GET_LOCATIONS)
  const { data: paymentsData, refetch: refetchPayments } = useQuery(GET_PAYROLL_PAYMENTS, {
    variables: { period: selectedMonth },
  })
  const [paySalary, { loading: paying }] = useMutation(PAY_SALARY)

  const employees: Employee[] = employeesData?.employees || []
  const locations: Location[] = locationsData?.locations || []
  const payments:
    | Array<{ employee_id: string; paid: boolean; amount?: number | null; hours_worked?: number | null }>
    | [] = paymentsData?.payrollPayments || []
  const paidMap = new Map(payments.map((p) => [String(p.employee_id), p.paid]))
  const amountMap = new Map(payments.map((p) => [String(p.employee_id), p.amount ?? null]))

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === "all" || employee.location?.id === locationFilter
    return matchesSearch && matchesLocation && employee.status === "active"
  })

  const calculateNetSalary = (employee: Employee) => {
    // Keep existing logic for preview display; actual payment amount is computed on the server (hours * price_h)
    const baseSalary = employee.salaire || 0
    const prime = employee.prime || 0
    const avance = employee.avance || 0
    const penalties = (employee.infractions || 0) * 15 + (employee.retard || 0) * 15 + (employee.absence || 0) * 10
    return baseSalary + prime - avance - penalties
  }

  const totalSalaries = filteredEmployees.reduce((sum, emp) => sum + calculateNetSalary(emp), 0)
  const totalBonuses = filteredEmployees.reduce((sum, emp) => sum + (emp.prime || 0), 0)
  const totalPenalties = filteredEmployees.reduce(
    (sum, emp) => sum + (emp.infractions || 0) * 15 + (emp.retard || 0) * 15 + (emp.absence || 0) * 10,
    0,
  )
  const totalAdvances = filteredEmployees.reduce((sum, emp) => sum + (emp.avance || 0), 0)

  const formatAmount = (n: number) =>
    `${n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}DT`
  const monthText = monthLabel(selectedMonth, locale)

  if (employeesLoading) {
    return (
      <div className="min-h-screen p-3 sm:p-4 lg:p-6">
        <div className="max-w-screen-xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold" dir="auto">
              {t.pageTitle}
            </h1>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <Skeleton className="h-4 w-20" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden animate-fade-in" dir="ltr">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-green-900/60 to-slate-900/80 backdrop-blur-[6px]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-30 animate-float"
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
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 via-green-800/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] rounded-2xl" />
          <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-700/40 to-blue-700/40 rounded-xl flex items-center justify-center border border-white/10">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent truncate"
                dir="auto"
              >
                {t.pageTitle}
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base" dir="auto">
                {t.pageSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-white truncate" dir="auto">
                {t.payrollMass}
              </CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-300 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-green-400 truncate">{formatAmount(totalSalaries)}</div>
              <p className="text-[10px] sm:text-xs text-green-200" dir="auto">
                {t.payrollMassSub}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-white truncate" dir="auto">
                {t.bonuses}
              </CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-300 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-blue-400 truncate">+{formatAmount(totalBonuses)}</div>
              <p className="text-[10px] sm:text-xs text-blue-200" dir="auto">
                {t.bonusesSub}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-white truncate" dir="auto">
                {t.penalties}
              </CardTitle>
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-300 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-red-400 truncate">-{formatAmount(totalPenalties)}</div>
              <p className="text-[10px] sm:text-xs text-red-200" dir="auto">
                {t.penaltiesSub}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-white truncate" dir="auto">
                {t.advances}
              </CardTitle>
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-orange-300 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-orange-400 truncate">-{formatAmount(totalAdvances)}</div>
              <p className="text-[10px] sm:text-xs text-orange-200" dir="auto">
                {t.advancesSub}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
          <CardHeader className="px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm sm:text-base" dir="auto">
                {t.filters}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden text-white"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className={`px-3 sm:px-6 ${!mobileFiltersOpen ? "hidden sm:block" : ""}`}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 sm:pl-8 text-xs sm:text-sm glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                  />
                </div>
              </div>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white">
                  <SelectValue placeholder={t.restaurant} />
                </SelectTrigger>
                <SelectContent className="glass-card bg-gradient-to-br from-slate-900/90 to-green-900/90 border border-white/10 text-white">
                  <SelectItem value="all" className="glass-card bg-transparent text-white text-xs sm:text-sm">
                    <span dir="auto">{t.allRestaurants}</span>
                  </SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id} className="glass-card bg-transparent text-white text-xs sm:text-sm">
                      <span dir="auto">{location.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-[150px] text-xs sm:text-sm glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                aria-label={t.month}
              />

              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span dir="auto">{t.export}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Salary Management Table */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="flex items-center text-white text-sm sm:text-base">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span dir="auto">{t.tableTitle}</span>
            </CardTitle>
            <CardDescription className="text-green-200 text-xs sm:text-sm" dir="auto">
              {t.tableSubtitle(monthText)}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0 sm:px-6">
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3 px-3">
              {filteredEmployees.map((employee) => {
                const penalties =
                  (employee.infractions || 0) * 15 + (employee.retard || 0) * 15 + (employee.absence || 0) * 10
                const netSalary = calculateNetSalary(employee)
                const paid = paidMap.get(String(employee.id)) === true
                const amt = amountMap.get(String(employee.id))
                const paidLabel = paid && typeof amt === "number" ? t.paidWith(formatAmount(amt)) : t.paid

                return (
                  <Card key={employee.id} className="glass-card bg-gradient-to-br from-slate-800/50 to-green-900/50 border border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm truncate" dir="auto">
                            {employee.prenom} {employee.nom}
                          </div>
                          <div className="text-xs text-green-200 truncate" dir="auto">
                            {employee.job_title}
                          </div>
                          <div className="text-xs text-blue-200 truncate" dir="auto">
                            {employee.location ? employee.location.name : t.notAssigned}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            <span className={netSalary >= 0 ? "text-green-400" : "text-red-400"}>
                              {formatAmount(netSalary)}
                            </span>
                          </div>
                          {paid ? (
                            <Badge className="bg-emerald-600/30 text-emerald-300 border border-emerald-600/40 text-xs" dir="auto">
                              {t.paid}
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-600/30 text-yellow-300 border border-yellow-600/40 text-xs" dir="auto">
                              {t.unpaid}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <span className="text-slate-300">Base: </span>
                          <span className="text-white font-medium">{formatAmount(employee.salaire || 0)}</span>
                        </div>
                        <div>
                          <span className="text-slate-300">Prime: </span>
                          <span className="text-blue-300 font-medium">+{formatAmount(employee.prime || 0)}</span>
                        </div>
                        <div>
                          <span className="text-slate-300">Avance: </span>
                          <span className="text-orange-300 font-medium">-{formatAmount(employee.avance || 0)}</span>
                        </div>
                        <div>
                          <span className="text-slate-300">Pénalités: </span>
                          <span className="text-red-400 font-medium">-{formatAmount(penalties)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={paid || paying}
                          className="flex-1 text-xs glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                          onClick={async () => {
                            try {
                              await paySalary({ variables: { employee_id: employee.id, period: selectedMonth } })
                              toast.success("Salaire payé avec succès!")
                              await refetchPayments()
                              await refetchEmployees()
                            } catch (e) {
                              console.error(e)
                              toast.error("Échec du paiement.")
                            }
                          }}
                        >
                          <Banknote className="w-3 h-3 mr-1" />
                          Payer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs glass-card bg-gradient-to-br from-slate-800/80 to-blue-900/80 border border-white/10 text-white"
                          onClick={() => setOpenCalendarFor(employee)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {t.viewDetails}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <Table className="text-white">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs lg:text-sm" dir="auto">{t.colEmployee}</TableHead>
                    <TableHead className="text-xs lg:text-sm hidden lg:table-cell" dir="auto">{t.colRestaurant}</TableHead>
                    <TableHead className="text-xs lg:text-sm" dir="auto">{t.colBaseSalary}</TableHead>
                    <TableHead className="text-xs lg:text-sm hidden md:table-cell" dir="auto">{t.colBonus}</TableHead>
                    <TableHead className="text-xs lg:text-sm hidden md:table-cell" dir="auto">{t.colAdvance}</TableHead>
                    <TableHead className="text-xs lg:text-sm hidden lg:table-cell" dir="auto">{t.colPenalties}</TableHead>
                    <TableHead className="text-xs lg:text-sm" dir="auto">{t.colNetPay}</TableHead>
                    <TableHead className="text-xs lg:text-sm" dir="auto">{t.colStatus}</TableHead>
                    <TableHead className="text-xs lg:text-sm" dir="auto">{t.colActions}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredEmployees.map((employee) => {
                    const penalties =
                      (employee.infractions || 0) * 15 + (employee.retard || 0) * 15 + (employee.absence || 0) * 10
                    const netSalary = calculateNetSalary(employee)
                    const paid = paidMap.get(String(employee.id)) === true
                    const amt = amountMap.get(String(employee.id))
                    const paidLabel = paid && typeof amt === "number" ? t.paidWith(formatAmount(amt)) : t.paid

                    return (
                      <TableRow key={employee.id} className="hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium">
                          <button
                            onClick={() => setOpenCalendarFor(employee)}
                            className="text-left hover:underline decoration-green-400/70 underline-offset-4"
                            aria-label="Ouvrir le calendrier"
                          >
                            <div className="font-semibold text-white text-xs lg:text-sm" dir="auto">
                              {employee.prenom} {employee.nom}
                            </div>
                            <div className="text-xs text-green-200" dir="auto">
                              {employee.job_title}
                            </div>
                          </button>
                        </TableCell>

                        <TableCell className="text-blue-200 text-xs lg:text-sm hidden lg:table-cell" dir="auto">
                          {employee.location ? employee.location.name : t.notAssigned}
                        </TableCell>

                        <TableCell>
                          <span className="font-medium text-white text-xs lg:text-sm">
                            {formatAmount((employee.salaire || 0) as number)}
                          </span>
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          <span className="font-medium text-blue-300 text-xs lg:text-sm">+{formatAmount(employee.prime || 0)}</span>
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          <span className="font-medium text-orange-300 text-xs lg:text-sm">-{formatAmount(employee.avance || 0)}</span>
                        </TableCell>

                        <TableCell className="hidden lg:table-cell">
                          <div className="text-xs">
                            <div className="text-red-400 font-medium">-{formatAmount(penalties)}</div>
                            <div className="text-xs text-red-200">
                              {employee.retard || 0}R • {employee.absence || 0}A • {employee.infractions || 0}I
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-bold text-sm lg:text-lg">
                            <span className={netSalary >= 0 ? "text-green-400" : "text-red-400"}>
                              {formatAmount(netSalary)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {paid ? (
                            <Badge className="bg-emerald-600/30 text-emerald-300 border border-emerald-600/40 text-xs" dir="auto">
                              {t.paid}
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-600/30 text-yellow-300 border border-yellow-600/40 text-xs" dir="auto">
                              {t.unpaid}
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex space-x-1 lg:space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={paid || paying}
                              className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white text-xs p-1 lg:p-2"
                              aria-label="Marquer comme payé"
                              onClick={async () => {
                                try {
                                  await paySalary({ variables: { employee_id: employee.id, period: selectedMonth } })
                                  toast.success(
                                    "Salaire payé (basé sur heures × prix horaire) et primes/avances réinitialisées.",
                                  )
                                  await refetchPayments()
                                  await refetchEmployees()
                                } catch (e) {
                                  console.error(e)
                                  toast.error("Échec du paiement.")
                                }
                              }}
                            >
                              <Banknote className="w-3 h-3 lg:w-4 lg:h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white text-xs p-1 lg:p-2"
                              aria-label="Exporter le bulletin"
                            >
                              <Download className="w-3 h-3 lg:w-4 lg:h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-green-200 text-sm" dir="auto">
                {t.noneFound}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calendar modal */}
      <WorkCalendarModal
        lang={lang}
        employee={openCalendarFor}
        onOpenChange={(open) => !open && setOpenCalendarFor(null)}
        ym={selectedMonth}
        paySalary={paySalary}
        refetchPayments={refetchPayments}
        refetchEmployees={refetchEmployees}
      />

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

function WorkCalendarModal({
  lang,
  employee,
  ym,
  onOpenChange,
  paySalary,
  refetchPayments,
  refetchEmployees,
}: {
  lang: Lang
  employee: Employee | null
  ym: string
  onOpenChange: (open: boolean) => void
  paySalary: any
  refetchPayments: any
  refetchEmployees: any
}) {
  const t = translations[lang]
  const locale = lang === "ar" ? "ar" : "fr-FR"
  const open = !!employee
  const { startDate, endDate, lastDay } = monthStartEnd(ym)
  const monthText = monthLabel(ym, locale)

  const { data: teData, loading: teLoading } = useQuery(GET_TIME_ENTRIES, {
    variables: { employeeId: employee?.id, startDate, endDate },
    skip: !employee || !employee.id,
    fetchPolicy: "cache-and-network",
  })

  const { data: schedulesData, loading: schedulesLoading } = useQuery(GET_WORK_SCHEDULES_RANGE, {
    variables: { employee_id: employee?.id, start: startDate, end: endDate },
    skip: !employee || !employee.id,
    fetchPolicy: "cache-and-network",
  })

  const { data: locationsData } = useQuery(GET_LOCATIONS, { fetchPolicy: "cache-first" })

  const allLocationsList = useMemo(() => locationsData?.locations.map((l: any) => ({
    id: String(l.id),
    name: l.name,
  })) || [], [locationsData])

  const timeEntries = teData?.timeEntries || []
  const workSchedules = schedulesData?.workSchedulesRange || []

  // Filter schedules for the month and normalize dates
  const monthSchedules = useMemo(() => {
    return workSchedules.filter((s: any) => {
      const date = new Date(normalizeDateKey(s.date))
      return date.getFullYear() === parseInt(ym.split('-')[0]) && (date.getMonth() + 1) === parseInt(ym.split('-')[1])
    })
  }, [workSchedules, ym])

  // Build dayShifts
  const dayShifts = useMemo(() => {
    const shifts: Record<number, { shift: string; location_id?: string; job_position?: string }> = {}
    monthSchedules.forEach((s: any) => {
      const date = new Date(normalizeDateKey(s.date))
      const day = date.getDate()
      shifts[day] = {
        shift: s.shift_type,
        location_id: s.shift_type === "Repos" ? "0" : String(s.location_id),
        job_position: s.job_position,
      }
    })
    return shifts
  }, [monthSchedules])

  // Calculate stats
  const [single_days, double_days] = useMemo(() => {
    let single = 0, double = 0
    for (const s of monthSchedules) {
      if (s.shift_type === 'Doublage') double++
      else if (s.shift_type === 'Matin' || s.shift_type === 'Soirée') single++
    }
    return [single, double]
  }, [monthSchedules])

  const workedDays = single_days + double_days
  const offDays = lastDay - workedDays
  const totalHours = single_days * 9 + double_days * 18
  const hourlyRate = employee?.price_h || 15
  const bonus = employee?.prime || 0
  const advances = employee?.avance || 0
  const estimatedAmount = totalHours * hourlyRate + bonus - advances
  const justifiedAbsences = Math.floor((employee?.absence || 0) * 0.6)
  const unjustifiedAbsences = Math.ceil((employee?.absence || 0) * 0.4)
  const absencesWithoutNotice = Math.floor((employee?.absence || 0) * 0.2)
  const infractions = employee?.infractions || 0
  const lateCount = employee?.retard || 0

  const monthInfo = useMemo(() => getMonthInfo(new Date(`${ym}-01`)), [ym])
  const grid = monthInfo.grid

  const handlePayment = async () => {
    if (!employee) return
    try {
      await paySalary({
        variables: {
          employee_id: employee.id,
          period: ym,
        },
      })
      toast.success("Paiement effectué avec succès!")
      onOpenChange(false)
      await refetchPayments()
      await refetchEmployees()
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du paiement")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[95vh] overflow-y-auto border border-white/10 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl text-white rounded-2xl p-0">
        <DialogHeader className="p-3 sm:p-6 border-b border-white/10 bg-gradient-to-r from-green-900/20 to-blue-900/20">
          <DialogTitle className="text-base sm:text-xl font-bold flex items-center gap-2 sm:gap-3 pr-8" dir="auto">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="truncate">
              {employee ? t.calendarTitle(`${employee.prenom} ${employee.nom}`) : t.calendarTitle("")}
            </span>
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-xs sm:text-base" dir="auto">
            {t.calendarDesc(monthText)}
          </DialogDescription>
  
         
   
        </DialogHeader>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="inline-block size-2 rounded-full bg-emerald-400" />
                <span dir="auto">{t.legendSingle}</span>
              </div>
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="inline-block size-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.35)]" />
                <span dir="auto">{t.legendDouble}</span>
              </div>
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-slate-600/10 border border-slate-600/20">
                <span className="inline-block size-2 rounded-full bg-slate-600" />
                <span dir="auto">{t.legendOff}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => {
                const d = new Date(`${ym}-01`)
                d.setMonth(d.getMonth() - 1)
                onOpenChange(false)
              }} aria-label={t.prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm">{monthText}</div>
              <Button variant="ghost" size="icon" onClick={() => {
                const d = new Date(`${ym}-01`)
                d.setMonth(d.getMonth() + 1)
                onOpenChange(false)
              }} aria-label={t.nextMonth}>
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
                if (!d) return <div key={`empty-${idx}`} className="h-16 sm:h-20" />
                const ds = ymd(d)
                const assign = dayShifts[d.getDate()]
                const shift = assign?.shift
                const isDouble = shift === "Doublage"
                const isSimple = shift === "Matin" || shift === "Soirée"
                const isRepos = !shift || shift === "Repos"

                const isToday = ds === ymd(new Date())

                return (
                  <div
                    key={ds}
                    className={`relative rounded-lg px-1 pt-2 pb-4 text-left transition-colors h-16 sm:h-20 w-full cursor-default ${
                      isToday
                        ? "bg-blue-600/20 hover:bg-blue-600/30 border-2 border-blue-500/50"
                        : "bg-white/5 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium block ${
                        isToday ? "text-blue-200" : "text-slate-200"
                      }`}
                    >
                      {d.getDate()}
                    </span>

                    {isToday && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
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

                    {assign?.location_id && shift !== "Repos" && (
                      <span
                        className="absolute right-1 bottom-1 text-[9px] px-1 py-0.5 rounded-md bg-slate-800/70 text-slate-100 border border-white/10"
                        title={allLocationsList.find((l: any) => l.id === assign.location_id)?.name ?? ""}
                      >
                        {getAbbrev(allLocationsList.find((l: any) => l.id === assign.location_id)?.name ?? "", 3)}
                      </span>
                    )}

                    {isRepos && (
                      <span
                        className="absolute right-1 bottom-1 text-[10px] font-bold text-white bg-gray-600/80 px-1 rounded"
                        title="Repos"
                      >
                        REP
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 rounded-xl sm:rounded-2xl border border-white/10 p-3 sm:p-6 shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              Statistiques du mois
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
              {/* Left Column - Attendance Stats */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-green-300 uppercase tracking-wide">Présence</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <span className="text-xs sm:text-sm text-white/90">Jours dans le mois</span>
                    <span className="text-sm sm:text-lg font-bold text-white">{lastDay}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-xs sm:text-sm text-white/90">Jours travaillés</span>
                    <span className="text-sm sm:text-lg font-bold text-emerald-400">{workedDays}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <span className="text-xs sm:text-sm text-white/90">Absences justifiées</span>
                    <span className="text-sm sm:text-lg font-bold text-yellow-400">{justifiedAbsences}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-xs sm:text-sm text-white/90">Absences non justifiées</span>
                    <span className="text-sm sm:text-lg font-bold text-blue-400">{unjustifiedAbsences}</span>
                  </div>
                </div>
              </div>

              {/* Middle Column - Performance Stats */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-blue-300 uppercase tracking-wide">Performance</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="text-xs sm:text-sm text-white/90">Infractions</span>
                    <span className="text-sm sm:text-lg font-bold text-red-400">{infractions}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <span className="text-xs sm:text-sm text-white/90">Retards</span>
                    <span className="text-sm sm:text-lg font-bold text-orange-400">{lateCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <span className="text-xs sm:text-sm text-white/90">Prime</span>
                    <span className="text-sm sm:text-lg font-bold text-green-400">+{bonus} DT</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Payment Action */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-semibold text-purple-300 uppercase tracking-wide">Action</h4>
                <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-xl p-3 sm:p-6 border border-green-500/30 text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <Banknote className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-white/80 mb-2">Salaire calculé</p>
                    <p className="text-lg sm:text-2xl font-bold text-white">
                      {estimatedAmount.toLocaleString()} DT
                    </p>
                  </div>
                  <Button
                    onClick={handlePayment}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 text-xs sm:text-sm"
                    disabled={schedulesLoading || teLoading}
                  >
                    <Banknote className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Payer
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {(teLoading || schedulesLoading) && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-slate-300 text-xs sm:text-sm">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin mr-2" />
                Chargement du planning...
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}