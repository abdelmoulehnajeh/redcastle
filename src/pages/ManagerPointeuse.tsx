import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Clock, Upload, Image, Camera, FileText } from "lucide-react";

const employees = [
  { id: "emp_001", name: "Ahmed Ben Ali", position: "Chef de Cuisine", tenueCount: 3, tenuePhotos: [] },
  { id: "emp_002", name: "Fatma Triki", position: "Serveuse", tenueCount: 2, tenuePhotos: [] },
  { id: "emp_003", name: "Mohamed Sassi", position: "Cuisinier", tenueCount: 3, tenuePhotos: [] },
  { id: "emp_004", name: "Leila Mansouri", position: "Caissière", tenueCount: 2, tenuePhotos: [] },
];

const ManagerPointeuse = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [tenueNumber, setTenueNumber] = useState("");
  const { toast } = useToast();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handleSavePhoto = () => {
    if (!photoFile || !tenueNumber) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une photo et entrer un numéro de tenue",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Photo uploadée",
      description: `Photo de la tenue #${tenueNumber} ajoutée avec succès`
    });
    
    setIsPhotoDialogOpen(false);
    setPhotoFile(null);
    setTenueNumber("");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Pointeuse Manager</h1>
        <p className="text-white/90">Gestion des tenues de travail et photos</p>
      </div>

      {/* Employee Tenue Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <Card key={employee.id} className="dashboard-card">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{employee.name}</CardTitle>
                  <CardDescription>{employee.position}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tenues disponibles:</span>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <FileText className="w-3 h-3" />
                  <span>{employee.tenueCount}</span>
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Photos uploadées:</span>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Image className="w-3 h-3" />
                  <span>{employee.tenuePhotos.length}</span>
                </Badge>
              </div>

              <Dialog open={isPhotoDialogOpen && selectedEmployee?.id === employee.id} onOpenChange={setIsPhotoDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Uploader Photo Tenue
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Uploader Photo de Tenue</DialogTitle>
                    <DialogDescription>
                      Ajoutez une photo de tenue pour {selectedEmployee?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="tenueNumber">Numéro de Tenue</Label>
                      <Input
                        id="tenueNumber"
                        type="text"
                        placeholder="Ex: T001, T002..."
                        value={tenueNumber}
                        onChange={(e) => setTenueNumber(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="photo">Photo de la Tenue</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <Label htmlFor="photo" className="cursor-pointer">
                          <div className="flex flex-col items-center space-y-2">
                            <Camera className="w-8 h-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {photoFile ? photoFile.name : "Cliquez pour sélectionner une photo"}
                            </p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleSavePhoto}>
                      Sauvegarder
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pointeuse Overview */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Aperçu Général des Pointeuses</span>
          </CardTitle>
          <CardDescription>État actuel de tous les employés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-accent/20 rounded-lg">
              <p className="text-2xl font-bold text-restaurant-green">5</p>
              <p className="text-sm text-muted-foreground">Employés en service</p>
            </div>
            <div className="text-center p-6 bg-accent/20 rounded-lg">
              <p className="text-2xl font-bold text-restaurant-yellow">2</p>
              <p className="text-sm text-muted-foreground">En pause</p>
            </div>
            <div className="text-center p-6 bg-accent/20 rounded-lg">
              <p className="text-2xl font-bold text-destructive">1</p>
              <p className="text-sm text-muted-foreground">Hors service</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerPointeuse;