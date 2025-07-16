import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Users, 
  Clock,
  Save,
  User,
  MapPin
} from "lucide-react";

const employees = [
  { id: "emp_001", name: "Ahmed Ben Ali", position: "Chef de Cuisine", location: "Auina" },
  { id: "emp_002", name: "Fatma Trabelsi", position: "Serveuse", location: "Auina" },
  { id: "emp_003", name: "Mohamed Cherif", position: "Cuisinier", location: "Auina" },
  { id: "emp_004", name: "Amal Bouzid", position: "Serveuse", location: "Auina" },
  { id: "emp_005", name: "Karim Mansour", position: "Manager", location: "El Manzah" },
  { id: "emp_006", name: "Sarra Hamdi", position: "Serveuse", location: "El Manzah" },
  { id: "emp_007", name: "Youssef Khedher", position: "Barista", location: "El Manzah" },
  { id: "emp_008", name: "Hedi Souissi", position: "Chef Principal", location: "Cuisine Centrale" },
  { id: "emp_009", name: "Nadia Kallel", position: "Sous-Chef", location: "Cuisine Centrale" },
  { id: "emp_010", name: "Slim Jebali", position: "Aide-Cuisinier", location: "Cuisine Centrale" }
];

const daysOfWeek = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" }
];

const shifts = [
  { value: "morning", label: "Matin (08:00 - 16:00)" },
  { value: "afternoon", label: "Après-midi (14:00 - 22:00)" },
  { value: "evening", label: "Soirée (18:00 - 02:00)" },
  { value: "off", label: "Repos" }
];

const AdminJournal = () => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [schedule, setSchedule] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const locations = [...new Set(employees.map(emp => emp.location))];
  const filteredEmployees = selectedLocation 
    ? employees.filter(emp => emp.location === selectedLocation)
    : employees;

  const handleScheduleChange = (day: string, shift: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: shift
    }));
  };

  const handleSaveSchedule = () => {
    if (!selectedEmployee) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un employé",
        variant: "destructive"
      });
      return;
    }

    const employee = employees.find(emp => emp.id === selectedEmployee);
    toast({
      title: "Planning sauvegardé",
      description: `Le planning de ${employee?.name} a été mis à jour avec succès`,
    });

    // Reset form
    setSchedule({});
  };

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Journal Administrateur</h1>
            <p className="text-white/90 text-sm md:text-base">
              Gérez les plannings de vos employés
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Filtrer par Restaurant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les restaurants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les restaurants</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Sélectionner un Employé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un employé" />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center space-x-2">
                      <span>{employee.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {employee.position}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Employee Selection Grid */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Employés
          </CardTitle>
          <CardDescription>
            Cliquez sur un employé pour modifier son planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                  selectedEmployee === employee.id 
                    ? "bg-primary/10 border-primary" 
                    : "border-border hover:bg-accent/50"
                }`}
                onClick={() => setSelectedEmployee(employee.id)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-castle text-white">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{employee.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{employee.position}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      {employee.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Editor */}
      {selectedEmployeeData && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Planning de {selectedEmployeeData.name}
            </CardTitle>
            <CardDescription>
              Définissez les horaires de travail pour la semaine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 p-4 border border-border rounded-lg">
                  <div className="md:w-32">
                    <span className="font-medium">{day.label}</span>
                  </div>
                  <div className="flex-1">
                    <Select 
                      value={schedule[day.key] || ""} 
                      onValueChange={(value) => handleScheduleChange(day.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un créneau" />
                      </SelectTrigger>
                      <SelectContent>
                        {shifts.map((shift) => (
                          <SelectItem key={shift.value} value={shift.value}>
                            {shift.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {schedule[day.key] && (
                    <Badge variant={schedule[day.key] === "off" ? "outline" : "default"}>
                      {shifts.find(s => s.value === schedule[day.key])?.label.split(' ')[0]}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSchedule} className="btn-restaurant">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder le Planning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminJournal;