import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Clock, 
  Calendar, 
  DollarSign, 
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Shirt
} from "lucide-react";

const employeeData = {
  "emp_001": {
    name: "Ahmed Ben Ali",
    photo: "",
    position: "Chef de Cuisine",
    location: "Auina",
    phone: "+216 98 123 456",
    email: "ahmed.benali@redcastle.tn",
    status: "active",
    workingNow: true,
    startTime: "09:00",
    pointeuse: {
      totalHours: "168h",
      thisMonth: "142h",
      avgDaily: "7.8h",
      sessions: [
        { date: "2024-01-15", start: "09:00", end: "17:30", duration: "8h30", restaurant: "Auina" },
        { date: "2024-01-14", start: "08:45", end: "17:15", duration: "8h30", restaurant: "Auina" },
        { date: "2024-01-13", start: "09:15", end: "17:45", duration: "8h30", restaurant: "Auina" }
      ]
    },
    journal: {
      scheduledDays: 22,
      workedDays: 18,
      plannedHours: "176h",
      actualHours: "142h"
    },
    finance: {
      baseSalary: 2500,
      overtime: 180,
      bonus: 150,
      deductions: 25,
      total: 2805,
      infractions: [
        { type: "Retard", date: "2024-01-10", penalty: 15, reason: "15min de retard" },
        { type: "Absence", date: "2024-01-05", penalty: 10, reason: "Absence justifiée" }
      ]
    },
    contract: {
      type: "CDI",
      startDate: "2023-06-01",
      hourlyRate: 15.5,
      weeklyHours: 40,
      tenueCount: 3
    }
  }
};

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    salaire: 2500,
    prime: 150,
    infractions: 25,
    absence: 2,
    retard: 1,
    bonus: 150,
    avance: 0,
    tenueCount: 3
  });
  
  const employee = employeeData[employeeId as keyof typeof employeeData];

  useEffect(() => {
    const userData = localStorage.getItem("restaurant_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleUpdateEmployee = () => {
    toast({
      title: "Employé mis à jour",
      description: "Les informations de l'employé ont été mises à jour avec succès"
    });
    setIsEditDialogOpen(false);
  };

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Employé non trouvé</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={employee.photo} />
            <AvatarFallback className="bg-white/20 text-white text-xl">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{employee.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{employee.position}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{employee.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>{employee.phone}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{employee.email}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-3">
              <Badge variant={employee.workingNow ? "default" : "outline"} className="bg-white/20 text-white border-white/30">
                {employee.workingNow ? `En Service depuis ${employee.startTime}` : "Hors Service"}
              </Badge>
              {user?.role === "admin" && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/20">
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Modifier les informations de l'employé</DialogTitle>
                      <DialogDescription>
                        Mettez à jour les informations financières et administratives
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="salaire">Salaire (€)</Label>
                        <Input
                          id="salaire"
                          type="number"
                          value={editData.salaire}
                          onChange={(e) => setEditData({...editData, salaire: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prime">Prime (€)</Label>
                        <Input
                          id="prime"
                          type="number"
                          value={editData.prime}
                          onChange={(e) => setEditData({...editData, prime: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="infractions">Infractions (€)</Label>
                        <Input
                          id="infractions"
                          type="number"
                          value={editData.infractions}
                          onChange={(e) => setEditData({...editData, infractions: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="absence">Absences (jours)</Label>
                        <Input
                          id="absence"
                          type="number"
                          value={editData.absence}
                          onChange={(e) => setEditData({...editData, absence: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="retard">Retards (nb)</Label>
                        <Input
                          id="retard"
                          type="number"
                          value={editData.retard}
                          onChange={(e) => setEditData({...editData, retard: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bonus">Bonus (€)</Label>
                        <Input
                          id="bonus"
                          type="number"
                          value={editData.bonus}
                          onChange={(e) => setEditData({...editData, bonus: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avance">Avance (€)</Label>
                        <Input
                          id="avance"
                          type="number"
                          value={editData.avance}
                          onChange={(e) => setEditData({...editData, avance: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tenueCount">Tenues de travail</Label>
                        <Input
                          id="tenueCount"
                          type="number"
                          value={editData.tenueCount}
                          onChange={(e) => setEditData({...editData, tenueCount: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleUpdateEmployee}>
                        Sauvegarder
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="pointeuse" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pointeuse" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Pointeuse</span>
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Journal</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Finance</span>
          </TabsTrigger>
          <TabsTrigger value="contrats" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Contrats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pointeuse" className="space-y-6">
          {/* Pointeuse Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dashboard-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{employee.pointeuse.totalHours}</p>
                  <p className="text-sm text-muted-foreground">Total ce mois</p>
                </div>
              </CardContent>
            </Card>
            <Card className="dashboard-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-restaurant-green">{employee.pointeuse.avgDaily}</p>
                  <p className="text-sm text-muted-foreground">Moyenne journalière</p>
                </div>
              </CardContent>
            </Card>
            <Card className="dashboard-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-restaurant-red">{employee.pointeuse.sessions.length}</p>
                  <p className="text-sm text-muted-foreground">Sessions récentes</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Sessions Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employee.pointeuse.sessions.map((session, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{new Date(session.date).toLocaleDateString('fr-FR')}</p>
                        <p className="text-sm text-muted-foreground">{session.restaurant}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{session.duration}</p>
                        <p className="text-sm text-muted-foreground">{session.start} - {session.end}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Planification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Jours programmés:</span>
                  <span className="font-medium">{employee.journal.scheduledDays}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jours travaillés:</span>
                  <span className="font-medium text-restaurant-green">{employee.journal.workedDays}</span>
                </div>
                <div className="flex justify-between">
                  <span>Heures prévues:</span>
                  <span className="font-medium">{employee.journal.plannedHours}</span>
                </div>
                <div className="flex justify-between">
                  <span>Heures réelles:</span>
                  <span className="font-medium">{employee.journal.actualHours}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Assiduité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {Math.round((employee.journal.workedDays / employee.journal.scheduledDays) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Taux de présence</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          {/* Salary Breakdown */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Détail du Salaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Salaire de base:</span>
                <span className="font-medium">{employee.finance.baseSalary}€</span>
              </div>
              <div className="flex justify-between">
                <span>Heures supplémentaires:</span>
                <span className="font-medium text-restaurant-green">+{employee.finance.overtime}€</span>
              </div>
              <div className="flex justify-between">
                <span>Primes:</span>
                <span className="font-medium text-restaurant-green">+{employee.finance.bonus}€</span>
              </div>
              <div className="flex justify-between">
                <span>Retenues:</span>
                <span className="font-medium text-destructive">-{employee.finance.deductions}€</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{employee.finance.total}€</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Infractions */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Infractions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.finance.infractions.map((infraction, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge variant={infraction.type === "Retard" ? "outline" : "destructive"}>
                          {infraction.type}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">{infraction.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-destructive">-{infraction.penalty}€</p>
                        <p className="text-sm text-muted-foreground">{new Date(infraction.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contrats" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Informations Contractuelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Type de contrat:</span>
                    <Badge className="bg-primary text-primary-foreground">{employee.contract.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Date d'embauche:</span>
                    <span className="font-medium">{new Date(employee.contract.startDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Taux horaire:</span>
                    <span className="font-medium">{employee.contract.hourlyRate}€/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heures hebdomadaires:</span>
                    <span className="font-medium">{employee.contract.weeklyHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tenues de travail:</span>
                    <span className="font-medium flex items-center">
                      <Shirt className="w-4 h-4 mr-1" />
                      {employee.contract.tenueCount}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDetails;