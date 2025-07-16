import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Clock,
  XCircle,
  CheckCircle,
  Eye
} from "lucide-react";

// Mock salary data
const salaryData = {
  currentMonth: {
    base: 2200,
    overtime: 150,
    bonus: 100,
    deductions: 45,
    total: 2405
  },
  hoursWorked: 168,
  targetHours: 175,
  hourlyRate: 13.5
};

// Mock infractions data
const infractions = [
  {
    id: "1",
    type: "Retard",
    date: "2024-01-15",
    time: "09:15",
    expectedTime: "09:00",
    delay: "15 min",
    penalty: 5,
    restaurant: "Le Gourmet",
    status: "processed"
  },
  {
    id: "2",
    type: "Absence",
    date: "2024-01-10",
    scheduledShift: "14:00 - 22:00",
    penalty: 108,
    restaurant: "Bistro Central",
    status: "processed"
  },
  {
    id: "3",
    type: "Retard",
    date: "2024-01-08",
    time: "08:30",
    expectedTime: "08:00",
    delay: "30 min",
    penalty: 10,
    restaurant: "Café du Coin",
    status: "disputed"
  },
];

const Finance = () => {
  const progressPercentage = (salaryData.hoursWorked / salaryData.targetHours) * 100;

  const getInfractionBadge = (type: string) => {
    switch (type) {
      case "Retard":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Retard</Badge>;
      case "Absence":
        return <Badge variant="outline" className="border-red-500 text-red-600">Absence</Badge>;
      default:
        return <Badge variant="secondary">Autre</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-restaurant-green text-white">Traité</Badge>;
      case "disputed":
        return <Badge variant="outline" className="border-orange-500 text-orange-600">Contesté</Badge>;
      default:
        return <Badge variant="secondary">En cours</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Finance</h1>
            <p className="text-white/90 text-sm md:text-base">
              Consultez votre salaire et l'historique de vos infractions
            </p>
          </div>
        </div>
      </div>

      {/* Salary Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Salaire de Janvier 2024
            </CardTitle>
            <CardDescription>
              Détail de votre rémunération pour le mois en cours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Salaire de base</span>
                  <span className="font-medium">{salaryData.currentMonth.base}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Heures supplémentaires</span>
                  <span className="font-medium text-restaurant-green">+{salaryData.currentMonth.overtime}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Primes</span>
                  <span className="font-medium text-restaurant-green">+{salaryData.currentMonth.bonus}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Retenues/Pénalités</span>
                  <span className="font-medium text-destructive">-{salaryData.currentMonth.deductions}€</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-restaurant rounded-xl text-white">
                  <div className="text-3xl font-bold">{salaryData.currentMonth.total}€</div>
                  <div className="text-sm opacity-90">Salaire Net Estimé</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Heures travaillées</span>
                    <span>{salaryData.hoursWorked}h / {salaryData.targetHours}h</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Taux horaire: {salaryData.hourlyRate}€/h
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="w-5 h-5 mr-2" />
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-3 border border-border rounded-lg">
              <div className="text-2xl font-bold text-primary">96%</div>
              <div className="text-xs text-muted-foreground">Ponctualité</div>
            </div>
            
            <div className="text-center p-3 border border-border rounded-lg">
              <div className="text-2xl font-bold text-restaurant-green">3</div>
              <div className="text-xs text-muted-foreground">Infractions ce mois</div>
            </div>
            
            <div className="text-center p-3 border border-border rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">123€</div>
              <div className="text-xs text-muted-foreground">Pénalités totales</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infractions History */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Historique des Infractions
          </CardTitle>
          <CardDescription>
            Détail des retards et absences avec les pénalités appliquées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {infractions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-restaurant-green mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucune infraction enregistrée
                </p>
              </div>
            ) : (
              infractions.map((infraction) => (
                <div key={infraction.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        {getInfractionBadge(infraction.type)}
                        {getStatusBadge(infraction.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Date:</span>
                            <span>{new Date(infraction.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Restaurant:</span>
                            <span>{infraction.restaurant}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {infraction.type === "Retard" ? (
                            <>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Arrivée:</span>
                                <span>{infraction.time} (attendu: {infraction.expectedTime})</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <XCircle className="w-4 h-4 text-destructive" />
                                <span className="text-muted-foreground">Retard:</span>
                                <span className="text-destructive font-medium">{infraction.delay}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Service manqué:</span>
                              <span>{infraction.scheduledShift}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-destructive">-{infraction.penalty}€</div>
                      <div className="text-xs text-muted-foreground">Pénalité</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finance;