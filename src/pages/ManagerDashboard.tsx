import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  History
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const employees = [
  { id: "emp_001", name: "Ahmed Ben Ali", position: "Chef de Cuisine", location: "Auina", isWorking: true, startTime: "09:00", status: "present" },
  { id: "emp_002", name: "Fatma Triki", position: "Serveuse", location: "El Manzah", isWorking: true, startTime: "08:30", status: "present" },
  { id: "emp_003", name: "Mohamed Sassi", position: "Cuisinier", location: "Cuisine Centrale", isWorking: false, lastSeen: "Hier 17:30", status: "absent" },
  { id: "emp_004", name: "Leila Mansouri", position: "Caissière", location: "Auina", isWorking: true, startTime: "10:00", status: "late" },
  { id: "emp_005", name: "Karim Ben Salah", position: "Plongeur", location: "El Manzah", isWorking: false, lastSeen: "Aujourd'hui 14:00", status: "absent" },
  { id: "emp_006", name: "Sonia Hamdi", position: "Responsable", location: "Cuisine Centrale", isWorking: true, startTime: "08:00", status: "present" },
];

const workingDaysData = [
  { month: "Jan", days: 22, target: 26 },
  { month: "Fév", days: 24, target: 26 },
  { month: "Mar", days: 25, target: 26 },
  { month: "Avr", days: 23, target: 26 },
  { month: "Mai", days: 26, target: 26 },
  { month: "Jun", days: 24, target: 26 }
];

const historyData = [
  { id: "emp_001", name: "Ahmed Ben Ali", date: "2024-01-15", startTime: "09:00", endTime: "17:30", hours: "8h30" },
  { id: "emp_002", name: "Fatma Triki", date: "2024-01-15", startTime: "08:30", endTime: "16:30", hours: "8h00" },
  { id: "emp_001", name: "Ahmed Ben Ali", date: "2024-01-14", startTime: "09:15", endTime: "17:45", hours: "8h30" },
  { id: "emp_004", name: "Leila Mansouri", date: "2024-01-14", startTime: "10:15", endTime: "18:15", hours: "8h00" },
];

const ManagerDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  
  const presentCount = employees.filter(emp => emp.isWorking).length;
  const absentCount = employees.filter(emp => !emp.isWorking).length;
  const lateCount = employees.filter(emp => emp.status === "late").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-restaurant-green text-white";
      case "late": return "bg-restaurant-yellow text-white";
      case "absent": return "bg-destructive text-white";
      default: return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return CheckCircle2;
      case "late": return AlertTriangle;
      case "absent": return XCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Tableau de Bord Manager</h1>
        <p className="text-white/90">Vue d'ensemble de tous les restaurants Red Castle</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytiques</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Historique</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="dashboard-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{employees.length}</p>
                    <p className="text-sm text-muted-foreground">Total Employés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-8 h-8 text-restaurant-green" />
                  <div>
                    <p className="text-2xl font-bold text-restaurant-green">{presentCount}</p>
                    <p className="text-sm text-muted-foreground">Présents</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-8 h-8 text-restaurant-yellow" />
                  <div>
                    <p className="text-2xl font-bold text-restaurant-yellow">{lateCount}</p>
                    <p className="text-sm text-muted-foreground">En Retard</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold text-destructive">{absentCount}</p>
                    <p className="text-sm text-muted-foreground">Absents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee List */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>État des Employés par Restaurant</CardTitle>
              <CardDescription>Suivi en temps réel de la présence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Auina", "El Manzah", "Cuisine Centrale"].map((location) => {
                  const locationEmployees = employees.filter(emp => emp.location === location);
                  return (
                    <div key={location} className="border border-border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 text-restaurant-red">{location}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {locationEmployees.map((employee) => {
                          const StatusIcon = getStatusIcon(employee.status);
                          return (
                            <div key={employee.id} className="flex items-center space-x-3 p-3 rounded-lg bg-accent/30">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback>
                                  {employee.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{employee.name}</p>
                                <p className="text-xs text-muted-foreground">{employee.position}</p>
                              </div>
                              
                              <div className="flex flex-col items-end space-y-1">
                                <Badge className={getStatusColor(employee.status)}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {employee.status === "present" ? "Présent" : 
                                   employee.status === "late" ? "Retard" : "Absent"}
                                </Badge>
                                {employee.isWorking && (
                                  <p className="text-xs text-muted-foreground">Depuis {employee.startTime}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Jours Travaillés par Mois</CardTitle>
                <CardDescription>Comparaison avec les objectifs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workingDaysData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="days" fill="hsl(var(--restaurant-red))" name="Jours travaillés" />
                    <Bar dataKey="target" fill="hsl(var(--restaurant-green))" name="Objectif" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Tendance de Présence</CardTitle>
                <CardDescription>Évolution mensuelle</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={workingDaysData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="days" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="Jours travaillés"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Historique des Employés</CardTitle>
              <CardDescription>Sessions de travail récentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Employé</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Début</th>
                      <th className="text-left p-3">Fin</th>
                      <th className="text-left p-3">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((record, index) => (
                      <tr key={index} className="border-b hover:bg-accent/30">
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {record.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{record.name}</span>
                          </div>
                        </td>
                        <td className="p-3">{new Date(record.date).toLocaleDateString('fr-FR')}</td>
                        <td className="p-3">{record.startTime}</td>
                        <td className="p-3">{record.endTime}</td>
                        <td className="p-3">
                          <Badge variant="outline">{record.hours}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerDashboard;