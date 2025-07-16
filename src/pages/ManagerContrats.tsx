import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Download, Edit, Camera, Shirt } from "lucide-react";

const employees = [
  { 
    id: "emp_001", 
    name: "Ahmed Ben Ali", 
    position: "Chef de Cuisine", 
    contractType: "CDI",
    startDate: "2023-06-01",
    hourlyRate: 15.5,
    weeklyHours: 40,
    tenueCount: 3,
    contractPhotos: []
  },
  { 
    id: "emp_002", 
    name: "Fatma Triki", 
    position: "Serveuse", 
    contractType: "CDD",
    startDate: "2024-01-15",
    hourlyRate: 12.0,
    weeklyHours: 35,
    tenueCount: 2,
    contractPhotos: []
  },
  { 
    id: "emp_003", 
    name: "Mohamed Sassi", 
    position: "Cuisinier", 
    contractType: "CDI",
    startDate: "2023-09-10",
    hourlyRate: 14.0,
    weeklyHours: 40,
    tenueCount: 3,
    contractPhotos: []
  },
  { 
    id: "emp_004", 
    name: "Leila Mansouri", 
    position: "Caissière", 
    contractType: "CDI",
    startDate: "2023-11-20",
    hourlyRate: 13.0,
    weeklyHours: 35,
    tenueCount: 2,
    contractPhotos: []
  },
];

const ManagerContrats = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    contractType: "",
    hourlyRate: 0,
    weeklyHours: 0,
    tenueCount: 0
  });
  const [contractPhoto, setContractPhoto] = useState<File | null>(null);
  const { toast } = useToast();

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setEditData({
      contractType: employee.contractType,
      hourlyRate: employee.hourlyRate,
      weeklyHours: employee.weeklyHours,
      tenueCount: employee.tenueCount
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveContract = () => {
    toast({
      title: "Contrat envoyé",
      description: `Contrat de ${selectedEmployee?.name} envoyé à l'administrateur pour approbation`
    });
    setIsEditDialogOpen(false);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setContractPhoto(file);
    }
  };

  const handleSavePhoto = () => {
    if (!contractPhoto) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une photo de contrat",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Photo uploadée",
      description: `Photo de contrat ajoutée pour ${selectedEmployee?.name}`
    });
    
    setIsPhotoDialogOpen(false);
    setContractPhoto(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Contrats Manager</h1>
        <p className="text-white/90">Gestion des contrats et documents employés</p>
      </div>

      {/* Contract Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-sm text-muted-foreground">Total Contrats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Badge className="w-8 h-8 bg-restaurant-green text-white flex items-center justify-center">CDI</Badge>
              <div>
                <p className="text-2xl font-bold text-restaurant-green">{employees.filter(e => e.contractType === "CDI").length}</p>
                <p className="text-sm text-muted-foreground">Contrats CDI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Badge className="w-8 h-8 bg-restaurant-yellow text-white flex items-center justify-center">CDD</Badge>
              <div>
                <p className="text-2xl font-bold text-restaurant-yellow">{employees.filter(e => e.contractType === "CDD").length}</p>
                <p className="text-sm text-muted-foreground">Contrats CDD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shirt className="w-8 h-8 text-restaurant-red" />
              <div>
                <p className="text-2xl font-bold text-restaurant-red">{employees.reduce((sum, e) => sum + e.tenueCount, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Tenues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Contracts Management */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Gestion des Contrats Employés</CardTitle>
          <CardDescription>Modifier les contrats et uploader des documents</CardDescription>
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
                  <Badge className={employee.contractType === "CDI" ? "bg-restaurant-green text-white" : "bg-restaurant-yellow text-white"}>
                    {employee.contractType}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-accent/20 rounded-lg">
                    <p className="text-lg font-semibold">{new Date(employee.startDate).toLocaleDateString('fr-FR')}</p>
                    <p className="text-xs text-muted-foreground">Date d'embauche</p>
                  </div>
                  
                  <div className="text-center p-3 bg-accent/20 rounded-lg">
                    <p className="text-lg font-semibold">{employee.hourlyRate}€/h</p>
                    <p className="text-xs text-muted-foreground">Taux horaire</p>
                  </div>
                  
                  <div className="text-center p-3 bg-accent/20 rounded-lg">
                    <p className="text-lg font-semibold">{employee.weeklyHours}h</p>
                    <p className="text-xs text-muted-foreground">Heures/semaine</p>
                  </div>
                  
                  <div className="text-center p-3 bg-accent/20 rounded-lg">
                    <p className="text-lg font-semibold flex items-center justify-center">
                      <Shirt className="w-4 h-4 mr-1" />
                      {employee.tenueCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Tenues travail</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditEmployee(employee)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier Contrat
                  </Button>
                  
                  <Dialog open={isPhotoDialogOpen && selectedEmployee?.id === employee.id} onOpenChange={setIsPhotoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Uploader Photo Contrat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Uploader Photo de Contrat</DialogTitle>
                        <DialogDescription>
                          Ajoutez une photo du contrat pour {selectedEmployee?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="contract-photo"
                          />
                          <Label htmlFor="contract-photo" className="cursor-pointer">
                            <div className="flex flex-col items-center space-y-2">
                              <Camera className="w-8 h-8 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {contractPhoto ? contractPhoto.name : "Cliquez pour sélectionner une photo"}
                              </p>
                            </div>
                          </Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleSavePhoto}>
                          Sauvegarder
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>

                {/* Edit Contract Dialog */}
                <Dialog open={isEditDialogOpen && selectedEmployee?.id === employee.id} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Modifier le Contrat</DialogTitle>
                      <DialogDescription>
                        Mettez à jour les informations contractuelles de {selectedEmployee?.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="contractType">Type de contrat</Label>
                        <Select value={editData.contractType} onValueChange={(value) => setEditData({...editData, contractType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CDI">CDI</SelectItem>
                            <SelectItem value="CDD">CDD</SelectItem>
                            <SelectItem value="Stage">Stage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Taux horaire (€)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          step="0.1"
                          value={editData.hourlyRate}
                          onChange={(e) => setEditData({...editData, hourlyRate: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weeklyHours">Heures/semaine</Label>
                        <Input
                          id="weeklyHours"
                          type="number"
                          value={editData.weeklyHours}
                          onChange={(e) => setEditData({...editData, weeklyHours: parseInt(e.target.value)})}
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
                      <Button type="submit" onClick={handleSaveContract}>
                        Sauvegarder
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerContrats;