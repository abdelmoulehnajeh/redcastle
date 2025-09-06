import { Building, Users, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface LocationCard3DProps {
  location: {
    id: string
    name: string
    address?: string
    manager?: {
      prenom: string
      nom: string
    }
    employees?: any[]
  }
  t: {
    viewEmployees: string
    managerLabel: string
    employeesLabel: string
    notAssigned: string
  }
}

export function LocationCard3D({ location, t }: LocationCard3DProps) {
  const employeeCount = location.employees?.length || 0

  return (
    <div className="group relative transform-gpu perspective-1000">
      <Card
        className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg border border-slate-600/50 rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300"
        style={{
          transform: "perspective(1000px) rotateX(8deg) rotateY(4deg)",
          boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

        <CardContent className="p-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 shadow-lg">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg" dir="auto">
                  {location.name}
                </h3>
                {location.address && (
                  <p className="text-sm text-gray-400" dir="auto">
                    {location.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{t.managerLabel}</span>
              {location.manager ? (
                <div className="flex items-center gap-1 text-sm text-gray-300" dir="auto">
                  <User className="h-3 w-3" />
                  <span>
                    {location.manager.prenom} {location.manager.nom}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">{t.notAssigned}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{t.employeesLabel}</span>
              <div className="flex items-center gap-1 text-sm text-gray-300">
                <Users className="h-3 w-3" />
                <span>{employeeCount}</span>
              </div>
            </div>
          </div>

          <Link href={`/dashboard/admin/employees?location=${location.id}`}>
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 rounded-xl transition-all duration-300 shadow-lg"
              style={{ boxShadow: "0 8px 20px -5px rgba(59, 130, 246, 0.4)" }}
            >
              <Users className="h-4 w-4 mr-2" />
              <span dir="auto">{t.viewEmployees}</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
