"use client"

import React from "react"
import { useMemo } from "react"
import { Calendar, Clock } from "lucide-react"
import { useQuery } from "@apollo/client"
import { useAuth } from "@/lib/auth-context"
import { GET_WORK_SCHEDULES } from "@/lib/graphql-queries"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLang, type Lang } from "@/lib/i18n"

type Dict = {
  headerTitle: string
  headerSubtitle: string
  tableTitle: string
  tableSubtitle: string
  thDay: string
  thType: string
  thStart: string
  thEnd: string
  thStatus: string
  noSessions: string
  worked: string
  off: string
  nonTravaille: string
  travaille: string
  enTravaille: string
  vide: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    headerTitle: "Journal de Travail",
    headerSubtitle: "Consultez votre planning et historique",
    tableTitle: "Mes horaires de travail",
    tableSubtitle: "Liste de vos sessions de travail",
    thDay: "Jour",
    thType: "Type",
    thStart: "Début",
    thEnd: "Fin",
    thStatus: "Statut",
    noSessions: "Aucune session trouvée.",
    worked: "Travaillé",
    off: "Repos",
    nonTravaille: "Non Travaillé",
    travaille: "Travaillé",
    enTravaille: "En Travaille",
    vide: "",
  },
  ar: {
    headerTitle: "سجل العمل",
    headerSubtitle: "اطّلع على جدولك وسجلّك",
    tableTitle: "ساعات عملي",
    tableSubtitle: "قائمة جلسات عملك",
    thDay: "اليوم",
    thType: "النوع",
    thStart: "البدء",
    thEnd: "النهاية",
    thStatus: "الحالة",
    noSessions: "لا توجد جلسات.",
    worked: "تم العمل",
    off: "راحة",
    nonTravaille: "لم يعمل",
    travaille: "تم العمل",
    enTravaille: "يعمل حالياً",
    vide: "",
  },
}

// Move localStorage access to useEffect below
function parseAnyDate(input: string | number | Date): Date | null {
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input
  if (typeof input === "number") {
    const d = new Date(input)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof input === "string") {
    const s = input.trim()
    // numeric timestamp string
    if (/^\d+$/.test(s)) {
      const d = new Date(Number(s))
      return isNaN(d.getTime()) ? null : d
    }
    // ISO-like first
    const iso = Date.parse(s)
    if (!isNaN(iso)) {
      const d = new Date(iso)
      return isNaN(d.getTime()) ? null : d
    }
    // yyyy-mm-dd fallback
    const parts = s.replace(/['"\s]/g, "").split("-")
    if (parts.length === 3 && parts[0].length === 4) {
      const y = Number(parts[0])
      const m = Number(parts[1]) - 1
      const da = Number(parts[2])
      const d = new Date(y, m, da)
      return isNaN(d.getTime()) ? null : d
    }
  }
  return null
}

function formatISOInTunis(d: Date) {
  // Format YYYY-MM-DD using Africa/Tunis
  const fmt = new Intl.DateTimeFormat("fr-TN", {
    timeZone: "Africa/Tunis",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const parts = fmt.formatToParts(d)
  const y = parts.find((p) => p.type === "year")?.value ?? "0000"
  const m = parts.find((p) => p.type === "month")?.value ?? "01"
  const da = parts.find((p) => p.type === "day")?.value ?? "01"
  return `${y}-${m}-${da}`
}

function shiftLabel(value: string, lang: Lang) {
  if (lang === "ar") {
    switch (value) {
      case "Matin":
        return "صباحي"
      case "Soirée":
        return "مسائي"
      case "Doublage":
        return "مزدوج"
      case "Repos":
        return "راحة"
      default:
        return value || "—"
    }
  }
  // fr / default
  return value || "—"
}

function getCurrentDateInTunis(): string {
  const now = new Date()
  return formatISOInTunis(now)
}

function getDayStatus(scheduleDate: string | number): "past" | "current" | "future" {
  const currentDate = getCurrentDateInTunis()
  const scheduleDay = parseAnyDate(scheduleDate)

  if (!scheduleDay) return "future"

  const scheduleDateStr = formatISOInTunis(scheduleDay)

  if (scheduleDateStr < currentDate) return "past"
  if (scheduleDateStr === currentDate) return "current"
  return "future"
}

function getWorkStatus(schedule: any, dayStatus: "past" | "current" | "future", t: Dict): string {
  if (dayStatus === "future") {
    return t.vide // Empty for future days
  }

  if (dayStatus === "past") {
    return schedule.is_worked ? t.travaille : t.nonTravaille
  }

  if (dayStatus === "current") {
    return schedule.is_working ? t.enTravaille : t.nonTravaille
  }

  return t.vide
}

function getStatusStyling(schedule: any, dayStatus: "past" | "current" | "future") {
  if (dayStatus === "future") {
    return {
      bgClass: "bg-slate-700/40",
      textClass: "text-slate-400",
      iconClass: "text-slate-400",
    }
  }

  if (dayStatus === "past") {
    if (schedule.is_worked) {
      return {
        bgClass: "bg-green-900/40",
        textClass: "text-green-300",
        iconClass: "text-green-400",
      }
    } else {
      return {
        bgClass: "bg-red-900/40",
        textClass: "text-red-300",
        iconClass: "text-red-400",
      }
    }
  }

  if (dayStatus === "current") {
    if (schedule.is_working) {
      return {
        bgClass: "bg-blue-800/40",
        textClass: "text-blue-200",
        iconClass: "text-blue-300",
      }
    } else {
      return {
        bgClass: "bg-orange-900/40",
        textClass: "text-orange-300",
        iconClass: "text-orange-400",
      }
    }
  }

  return {
    bgClass: "bg-slate-700/40",
    textClass: "text-slate-400",
    iconClass: "text-slate-400",
  }
}

export default function JournalPage() {
  // Log user info from localStorage only on client
  React.useEffect(() => {
    const userString = typeof window !== "undefined" ? localStorage.getItem("restaurant_user") : null
    if (userString) {
      try {
        const user = JSON.parse(userString)
        //console.log("username:", user.username)
        //console.log("id:", user.id)
      } catch (e) {
        console.warn("Failed to parse restaurant_user from localStorage:", e)
      }
    }
  }, [])
  // i18n and formatting
  const { lang, formatDate } = useLang()
  const t = translations[lang]
  const align = lang === "ar" ? "text-right" : "text-left"

  const { user } = useAuth()
  const { data: scheduleData, loading } = useQuery(GET_WORK_SCHEDULES, {
    variables: { employee_id: user?.employee_id },
    skip: !user?.employee_id,
    fetchPolicy: "cache-and-network",
  })

  const schedules = Array.isArray(scheduleData?.workSchedules) ? scheduleData.workSchedules : []

  const sortedSchedules = useMemo(() => {
    const items = [...schedules]
    return items.sort((a: any, b: any) => {
      const dateA = parseAnyDate(a.date)
      const dateB = parseAnyDate(b.date)

      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      // Sort by date first
      const dateComparison = dateA.getTime() - dateB.getTime()
      if (dateComparison !== 0) return dateComparison

      // If same date, sort by shift type (Matin before Soirée)
      const shiftOrder = { Matin: 1, Soirée: 2, Doublage: 3, Repos: 4 }
      const shiftA = shiftOrder[a.shift_type as keyof typeof shiftOrder] || 5
      const shiftB = shiftOrder[b.shift_type as keyof typeof shiftOrder] || 5

      return shiftA - shiftB
    })
  }, [schedules])

  const formatDayLabel = (raw: string | number) => {
    const d = parseAnyDate(raw)
    if (!d) return "—"
    const dayName = formatDate(d, { weekday: "long" })
    const iso = formatISOInTunis(d)
    // Example: الاثنين 2025-07-21 (Arabic) or lundi 2025-07-21 (French)
    return `${dayName} ${iso}`
  }

  return (
    <div className="relative" dir="ltr">
      {/* Decorative background (subtle) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-900/30 via-slate-900/30 to-slate-950" />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="rounded-2xl border bg-gradient-to-br from-slate-900/80 to-slate-800/70 border-slate-700 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Calendar className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-white" dir="auto">
                {t.headerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-white/80" dir="auto">
                {t.headerSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="rounded-2xl border border-slate-700 bg-slate-900/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base sm:text-lg" dir="auto">
              {t.tableTitle}
            </CardTitle>
            <CardDescription className="text-slate-300" dir="auto">
              {t.tableSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop/tablet: table */}
            <div className="hidden md:block">
              <div className="relative overflow-x-auto rounded-xl">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow className="bg-slate-800/70 border-slate-700">
                      <TableHead className={`${align} text-slate-100`}>{t.thDay}</TableHead>
                      <TableHead className={`${align} text-slate-100`}>{t.thType}</TableHead>
                      <TableHead className={`${align} text-slate-100`}>{t.thStart}</TableHead>
                      <TableHead className={`${align} text-slate-100`}>{t.thEnd}</TableHead>
                      <TableHead className={`${align} text-slate-100`}>{t.thStatus}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={`skeleton-${i}`} className="border-slate-800/70">
                          <TableCell colSpan={5}>
                            <div className="h-5 w-full animate-pulse rounded bg-slate-700/50" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : sortedSchedules.length === 0 ? (
                      <TableRow className="border-slate-800/70">
                        <TableCell colSpan={5} className="text-center text-slate-400 py-6" dir="auto">
                          {t.noSessions}
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedSchedules.map((schedule: any, idx: number) => {
                        const isWorking = !!schedule.is_working
                        const start = schedule?.start_time ? String(schedule.start_time).slice(0, 5) : "—"
                        const end = schedule?.end_time ? String(schedule.end_time).slice(0, 5) : "—"
                        const shift = shiftLabel(String(schedule.shift_type ?? ""), lang)

                        const dayStatus = getDayStatus(schedule.date)
                        const rowClasses = {
                          past: "border-slate-800/70 hover:bg-slate-800/60 opacity-70 bg-slate-900/50",
                          current: "border-blue-500/50 hover:bg-blue-900/40 bg-blue-900/20 ring-1 ring-blue-500/30",
                          future: "border-slate-700/50 hover:bg-slate-800/30",
                        }

                        const textClasses = {
                          past: "text-slate-400",
                          current: "text-blue-100 font-medium",
                          future: "text-white",
                        }

                        const workStatus = getWorkStatus(schedule, dayStatus, t)
                        const statusStyling = getStatusStyling(schedule, dayStatus)

                        return (
                          <TableRow key={schedule.id ?? idx} className={rowClasses[dayStatus]}>
                            <TableCell className={`${textClasses[dayStatus]} ${align}`} dir="auto">
                              {formatDayLabel(schedule.date)}
                              {dayStatus === "current" && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500 text-white">
                                  {lang === "ar" ? "اليوم" : "Aujourd'hui"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className={`${align}`}>
                              <Badge
                                variant={isWorking ? "default" : "secondary"}
                                className={`px-2 ${
                                  dayStatus === "past"
                                    ? "bg-slate-600 text-slate-300"
                                    : dayStatus === "current"
                                      ? (isWorking ? "bg-blue-600 text-white" : "bg-blue-700 text-blue-100")
                                      : (isWorking ? "bg-orange-600 text-white" : "bg-red-600")
                                }`}
                              >
                                <span dir="auto">{shift}</span>
                              </Badge>
                            </TableCell>
                            <TableCell
                              className={`${dayStatus === "past" ? "text-slate-400" : "text-slate-200"} ${align}`}
                            >
                              {start}
                            </TableCell>
                            <TableCell
                              className={`${dayStatus === "past" ? "text-slate-400" : "text-slate-200"} ${align}`}
                            >
                              {end}
                            </TableCell>
                            <TableCell className={`${align}`}>
                              <div
                                className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg ${statusStyling.bgClass}`}
                              >
                                <Clock className={`size-4 ${statusStyling.iconClass}`} />
                                <span className={statusStyling.textClass} dir="auto">
                                  {workStatus}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile: card list */}
            <div className="md:hidden space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={`m-skel-${i}`} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-700/50 mb-3" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
                    </div>
                  </div>
                ))
              ) : sortedSchedules.length === 0 ? (
                <div
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400"
                  dir="auto"
                >
                  {t.noSessions}
                </div>
              ) : (
                sortedSchedules.map((schedule: any, idx: number) => {
                  const isWorking = !!schedule.is_working
                  const start = schedule?.start_time ? String(schedule.start_time).slice(0, 5) : "—"
                  const end = schedule?.end_time ? String(schedule.end_time).slice(0, 5) : "—"
                  const shift = shiftLabel(String(schedule.shift_type ?? ""), lang)

                  const dayStatus = getDayStatus(schedule.date)
                  const cardClasses = {
                    past: "rounded-xl border border-slate-800 bg-slate-900/40 p-4 opacity-70",
                    current: "rounded-xl border border-blue-500/50 bg-blue-900/30 p-4 ring-1 ring-blue-500/30",
                    future: "rounded-xl border border-slate-700/50 bg-slate-900/60 p-4",
                  }

                  const textClasses = {
                    past: "text-slate-400",
                    current: "text-blue-100 font-medium",
                    future: "text-white",
                  }

                  const workStatus = getWorkStatus(schedule, dayStatus, t)
                  const statusStyling = getStatusStyling(schedule, dayStatus)

                  return (
                    <div key={schedule.id ?? idx} className={cardClasses[dayStatus]}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${textClasses[dayStatus]}`} dir="auto">
                            {formatDayLabel(schedule.date)}
                          </p>
                          {dayStatus === "current" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500 text-white">
                              {lang === "ar" ? "اليوم" : "Aujourd'hui"}
                            </span>
                          )}
                        </div>
                        <Badge
                          variant={isWorking ? "default" : "secondary"}
                          className={`px-2 ${
                            dayStatus === "past"
                              ? "bg-slate-600 text-slate-300"
                              : dayStatus === "current"
                                ? (isWorking ? "bg-blue-600 text-white" : "bg-blue-700 text-blue-100")
                                : (isWorking ? "bg-blue-600 text-white" : "")
                          }`}
                        >
                          <span dir="auto">{shift}</span>
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className={`${dayStatus === "past" ? "text-slate-500" : "text-slate-400"}`} dir="auto">
                          {t.thStart}
                        </div>
                        <div className={`${dayStatus === "past" ? "text-slate-400" : "text-slate-200"} text-right`}>
                          {start}
                        </div>
                        <div className={`${dayStatus === "past" ? "text-slate-500" : "text-slate-400"}`} dir="auto">
                          {t.thEnd}
                        </div>
                        <div className={`${dayStatus === "past" ? "text-slate-400" : "text-slate-200"} text-right`}>
                          {end}
                        </div>
                        <div className={`${dayStatus === "past" ? "text-slate-500" : "text-slate-400"}`} dir="auto">
                          {t.thStatus}
                        </div>
                        <div className={`text-right flex items-center justify-end gap-2`}>
                          <Clock className={`size-4 ${statusStyling.iconClass}`} />
                          <span className={statusStyling.textClass} dir="auto">
                            {workStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
