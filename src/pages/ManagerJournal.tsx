import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const jobPositions = [
  { value: "chef", label: "Chef de Cuisine" },
  { value: "cook", label: "Cuisinier" },
  { value: "server", label: "Serveur/Serveuse" },
  { value: "cashier", label: "Caissier/Caissière" },
  { value: "cleaner", label: "Agent d'Entretien" },
  { value: "manager", label: "Manager" },
];

const ManagerJournal = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [schedule, setSchedule] = useState<{[key: string]: {shift: string}}>({
    monday: { shift: '' },
    tuesday: { shift: '' },
    wednesday: { shift: '' },
    thursday: { shift: '' },
    friday: { shift: '' },
    saturday: { shift: '' },
    sunday: { shift: '' },
  });
  const [selectedPosition, setSelectedPosition] = useState("");
  const { toast } = useToast();

  const handleShiftChange = (day: string, shift: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { shift }
    }));
  };

  const handleSaveSchedule = () => {
    const scheduleDetails = Object.entries(schedule)
      .map(([day, { shift }]) => {
        const dayLabel = weekDays.find(d => d.key === day)?.label;
        return shift ? `${dayLabel}: ${shift}` : null;
      })
      .filter(Boolean)
      .join(' | ');

    toast({
      title: "Planning envoyé",
      description: `Planning de ${selectedEmployee?.name} envoyé à l'administrateur pour approbation${selectedPosition ? ` - Poste: ${jobPositions.find(p => p.value === selectedPosition)?.label}` : ''}${scheduleDetails ? ` - ${scheduleDetails}` : ''}`
    });
    
    setIsScheduleDialogOpen(false);
    setSchedule({
      monday: { shift: '' },
      tuesday: { shift: '' },
      wednesday: { shift: '' },
      thursday: { shift: '' },
      friday: { shift: '' },
      saturday: { shift: '' },
      sunday: { shift: '' },
    });
    setSelectedPosition("");
  };

  const getCurrentSchedule = (employeeId: string) => {
    const schedules: {[key: string]: string[]} = {
      "emp_001": ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      "emp_002": ["Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
      "emp_003": ["Lundi", "Mercredi", "Vendredi", "Samedi", "Dimanche"],
      "emp_004": ["Lundi", "Mardi", "Jeudi", "Vendredi", "Samedi"],
    };
    return schedules[employeeId] || [];
  };

  return (
    <div className="space-y-8 animate-fade-in p-6 md:p-8">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-8 text-white shadow-elegant transform hover:scale-[1.01] transition-transform duration-300">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Journal Manager</h1>
        <p className="text-white/90 text-lg">Gestion des plannings et horaires des employés</p>
      </div>

      {/* Planning Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="dashboard-card bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="w-10 h-10 text-primary" />
              <div>
                <p className="text-3xl font-bold">{employees.length}</p>
                <p className="text-sm text-muted-foreground">Employés Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Calendar className="w-10 h-10 text-restaurant-green" />
              <div>
                <p className="text-3xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Jours Planifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Clock className="w-10 h-10 text-restaurant-red" />
              <div>
                <p className="text-3xl font-bold">168h</p>
                <p className="text-sm text-muted-foreground">Heures Prévues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Schedule Management */}
      <Card className="dashboard-card bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Gestion des Plannings Employés</CardTitle>
          <CardDescription className="text-muted-foreground">Modifiez les jours de travail pour chaque employé</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => {
              const currentDays = getCurrentSchedule(employee.id);
              return (
                <div key={employee.id} className="border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 bg-white/95">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-14 h-14 ring-2 ring-border">
                        <AvatarFallback className="bg-gray-100 text-primary font-semibold">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                        <Badge variant="outline" className="mt-2 text-xs bg-gray-50 text-primary border-primary/20">
                          {employee.location}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <p className="text-sm font-medium text-muted-foreground">Jours de travail actuels :</p>
                    <div className="flex flex-wrap gap-2">
                      {currentDays.map((day) => (
                        <Badge key={day} variant="default" className="text-xs bg-primary text-white hover:bg-primary/90">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Dialog open={isScheduleDialogOpen && selectedEmployee?.id === employee.id} onOpenChange={setIsScheduleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white" 
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Modifier Planning
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-sm">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Modifier le Planning</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Sélectionnez les jours de travail pour {selectedEmployee?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-6">
                        <div className="space-y-3">
                          <Label htmlFor="position" className="text-sm font-medium">Poste de Travail</Label>
                          <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                            <SelectTrigger className="bg-gray-50 border-border">
                              <SelectValue placeholder="Sélectionnez un poste" />
                            </SelectTrigger>
                            <SelectContent>
                              {jobPositions.map((position) => (
                                <SelectItem key={position.value} value={position.value}>
                                  {position.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">
                            Jours de la semaine et horaires :
                          </p>
                          {weekDays.map((day) => (
                            <div key={day.key} className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">{day.label}</Label>
                              <RadioGroup
                                value={schedule[day.key].shift}
                                onValueChange={(value) => handleShiftChange(day.key, value)}
                                className="flex flex-wrap gap-4 ml-4"
                              >
                                {['Matin', 'Soirée', 'Doublage'].map((shift) => (
                                  <div key={shift} className="flex items-center space-x-2">
                                    <RadioGroupItem value={shift} id={`${day.key}-${shift}`} />
                                    <Label htmlFor={`${day.key}-${shift}`} className="text-sm text-muted-foreground">
                                      {shift}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          ))}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          onClick={handleSaveSchedule}
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
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