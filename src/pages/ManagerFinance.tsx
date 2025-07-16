import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const employees = [
  { 
    id: "emp_001", 
    name: "Ahmed Ben Ali", 
    position: "Chef de Cuisine", 
    baseSalary: 2500, 
    overtime: 180, 
    bonus: 150, 
    deductions: 25, 
    total: 2805,
    infractions: 2
  },
  { 
    id: "emp_002", 
    name: "Fatma Triki", 
    position: "Serveuse", 
    baseSalary: 1800, 
    overtime: 120, 
    bonus: 100, 
    deductions: 15, 
    total: 2005,
    infractions: 1
  },
  { 
    id: "emp_003", 
    name: "Mohamed Sassi", 
    position: "Cuisinier", 
    baseSalary: 2200, 
    overtime: 160, 
    bonus: 120, 
    deductions: 30, 
    total: 2450,
    infractions: 3
  },
  { 
    id: "emp_004", 
    name: "Leila Mansouri", 
    position: "Caissière", 
    baseSalary: 1900, 
    overtime: 100, 
    bonus: 80, 
    deductions: 10, 
    total: 2070,
    infractions: 0
  },
];

const ManagerFinance = () => {
  const totalPayroll = employees.reduce((sum, emp) => sum + emp.total, 0);
  const totalBonuses = employees.reduce((sum, emp) => sum + emp.bonus, 0);
  const totalDeductions = employees.reduce((sum, emp) => sum + emp.deductions, 0);
  const totalInfractions = employees.reduce((sum, emp) => sum + emp.infractions, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Finance Manager</h1>
        <p className="text-white/90">Gestion des salaires et finances des employés</p>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalPayroll}€</p>
                <p className="text-sm text-muted-foreground">Total Salaires</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-restaurant-green" />
              <div>
                <p className="text-2xl font-bold text-restaurant-green">+{totalBonuses}€</p>
                <p className="text-sm text-muted-foreground">Total Primes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">-{totalDeductions}€</p>
                <p className="text-sm text-muted-foreground">Total Retenues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-restaurant-yellow" />
              <div>
                <p className="text-2xl font-bold text-restaurant-yellow">{totalInfractions}</p>
                <p className="text-sm text-muted-foreground">Total Infractions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Financial Details */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Détails Financiers par Employé</CardTitle>
          <CardDescription>Vue d'ensemble des salaires et retenues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {employees.map((employee) => (
              <div key={employee.id} className="border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{employee.total}€</p>
                    <p className="text-sm text-muted-foreground">Salaire Total</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-accent/20 rounded-lg">
                    <p className="text-lg font-semibold">{employee.baseSalary}€</p>
                    <p className="text-xs text-muted-foreground">Salaire Base</p>
                  </div>
                  
                  <div className="text-center p-3 bg-restaurant-green/10 rounded-lg">
                    <p className="text-lg font-semibold text-restaurant-green">+{employee.overtime}€</p>
                    <p className="text-xs text-muted-foreground">Heures Sup.</p>
                  </div>
                  
                  <div className="text-center p-3 bg-restaurant-green/10 rounded-lg">
                    <p className="text-lg font-semibold text-restaurant-green">+{employee.bonus}€</p>
                    <p className="text-xs text-muted-foreground">Primes</p>
                  </div>
                  
                  <div className="text-center p-3 bg-destructive/10 rounded-lg">
                    <p className="text-lg font-semibold text-destructive">-{employee.deductions}€</p>
                    <p className="text-xs text-muted-foreground">Retenues</p>
                  </div>
                  
                  <div className="text-center p-3 bg-restaurant-yellow/10 rounded-lg">
                    <p className="text-lg font-semibold text-restaurant-yellow">{employee.infractions}</p>
                    <p className="text-xs text-muted-foreground">Infractions</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex space-x-2">
                    {employee.infractions === 0 && (
                      <Badge className="bg-restaurant-green text-white">
                        Excellent Comportement
                      </Badge>
                    )}
                    {employee.infractions > 0 && employee.infractions <= 2 && (
                      <Badge variant="outline" className="border-restaurant-yellow text-restaurant-yellow">
                        {employee.infractions} Infraction{employee.infractions > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {employee.infractions > 2 && (
                      <Badge variant="destructive">
                        {employee.infractions} Infractions - Attention
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Taux de Performance</p>
                    <div className="flex items-center space-x-1">
                      {employee.infractions === 0 && <span className="text-restaurant-green">★★★★★</span>}
                      {employee.infractions === 1 && <span className="text-restaurant-green">★★★★☆</span>}
                      {employee.infractions === 2 && <span className="text-restaurant-yellow">★★★☆☆</span>}
                      {employee.infractions > 2 && <span className="text-destructive">★★☆☆☆</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerFinance;