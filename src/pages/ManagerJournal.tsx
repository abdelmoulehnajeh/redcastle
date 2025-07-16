import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Users, Save } from "lucide-react";

const employees = [
  { id: "emp_001", name: "Ahmed Ben Ali", position: "Chef de Cuisine", location: "Auina" },
  { id: "emp_002", name: "Fatma Triki", position: "Serveuse", location: "El Manzah" },
  { id: "emp_003", name: "Mohamed Sassi", position: "Cuisinier", location: "Cuisine Centrale" },
  { id: "emp_004", name: "Leila Mansouri", position: "Caissière", location: "Auina" },
];

const weekDays = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
];

const ManagerJournal = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [schedule, setSchedule] = useState<{[key: string]: boolean}>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const { toast } = useToast();

  const handleDayChange = (day: string, checked: boolean) => {
    setSchedule(prev => ({
      ...prev,
      [day]: checked
    }));
  };

  const handleSaveSchedule = () => {
    const selectedDays = Object.entries(schedule)
      .filter(([_, isSelected]) => isSelected)
      .map(([day, _]) => weekDays.find(d => d.key === day)?.label)
      .join(', ');

    toast({
      title: "Planning mis à jour",
      description: `Planning de ${selectedEmployee?.name} mis à jour: ${selectedDays || 'Aucun jour sélectionné'}`
    });
    
    setIsScheduleDialogOpen(false);
    setSchedule({
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    });
  };

  const getCurrentSchedule = (employeeId: string) => {
    // Mock current schedule data
    const schedules: {[key: string]: string[]} = {
      "emp_001": ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      "emp_002": ["Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
      "emp_003": ["Lundi", "Mercredi", "Vendredi", "Samedi", "Dimanche"],
      "emp_004": ["Lundi", "Mardi", "Jeudi", "Vendredi", "Samedi"],
    };
    return schedules[employeeId] || [];
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Journal Manager</h1>
        <p className="text-white/90">Gestion des plannings et horaires des employés</p>
      </div>

      {/* Planning Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-sm text-muted-foreground">Employés Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-restaurant-green" />
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Jours Planifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-restaurant-red" />
              <div>
                <p className="text-2xl font-bold">168h</p>
                <p className="text-sm text-muted-foreground">Heures Prévues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Schedule Management */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Gestion des Plannings Employés</CardTitle>
          <CardDescription>Modifiez les jours de travail pour chaque employé</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employees.map((employee) => {
              const currentDays = getCurrentSchedule(employee.id);
              return (
                <div key={employee.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                        <Badge variant="outline" className="text-xs mt-1">{employee.location}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Jours de travail actuels:</p>
                    <div className="flex flex-wrap gap-1">
                      {currentDays.map((day) => (
                        <Badge key={day} variant="default" className="text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Dialog open={isScheduleDialogOpen && selectedEmployee?.id === employee.id} onOpenChange={setIsScheduleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Modifier Planning
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Modifier le Planning</DialogTitle>
                        <DialogDescription>
                          Sélectionnez les jours de travail pour {selectedEmployee?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          Jours de la semaine:
                        </p>
                        {weekDays.map((day) => (
                          <div key={day.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={day.key}
                              checked={schedule[day.key]}
                              onCheckedChange={(checked) => handleDayChange(day.key, checked as boolean)}
                            />
                            <Label htmlFor={day.key} className="text-sm font-normal">
                              {day.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleSaveSchedule}>
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerJournal;