import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  MapPin, 
  Users, 
  Clock,
  Eye,
  ChefHat,
  UserCircle,
  Utensils,
  Coffee
} from "lucide-react";

const employeesByLocation = {
  "auina": [
    {
      id: "emp_001",
      name: "Ahmed Ben Ali",
      photo: "",
      position: "Chef de Cuisine",
      status: "active",
      workingNow: true,
      startTime: "09:00"
    },
    {
      id: "emp_002", 
      name: "Fatma Trabelsi",
      photo: "",
      position: "Serveuse",
      status: "active",
      workingNow: true,
      startTime: "10:30"
    },
    {
      id: "emp_003",
      name: "Mohamed Cherif",
      photo: "",
      position: "Cuisinier",
      status: "active",
      workingNow: false,
      startTime: "-"
    },
    {
      id: "emp_004",
      name: "Amal Bouzid",
      photo: "",
      position: "Serveuse",
      status: "active",
      workingNow: true,
      startTime: "11:00"
    }
  ],
  "el-manzah": [
    {
      id: "emp_005",
      name: "Karim Mansour",
      photo: "",
      position: "Manager",
      status: "active",
      workingNow: true,
      startTime: "08:00"
    },
    {
      id: "emp_006",
      name: "Sarra Hamdi",
      photo: "",
      position: "Serveuse",
      status: "active",
      workingNow: false,
      startTime: "-"
    },
    {
      id: "emp_007",
      name: "Youssef Khedher",
      photo: "",
      position: "Barista",
      status: "active",
      workingNow: true,
      startTime: "09:30"
    }
  ],
  "cuisine-centrale": [
    {
      id: "emp_008",
      name: "Hedi Souissi",
      photo: "",
      position: "Chef Principal",
      status: "active",
      workingNow: true,
      startTime: "07:00"
    },
    {
      id: "emp_009",
      name: "Nadia Kallel",
      photo: "",
      position: "Sous-Chef",
      status: "active",
      workingNow: true,
      startTime: "07:30"
    },
    {
      id: "emp_010",
      name: "Slim Jebali",
      photo: "",
      position: "Aide-Cuisinier",
      status: "active",
      workingNow: false,
      startTime: "-"
    }
  ]
};

const locationDetails = {
  "auina": { name: "Auina", address: "123 Rue Auina, Tunis" },
  "el-manzah": { name: "El Manzah", address: "456 Avenue El Manzah, Tunis" },
  "cuisine-centrale": { name: "Cuisine Centrale", address: "789 Zone Industrielle, Tunis" }
};

const AdminLocation = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  
  const location = locationDetails[locationId as keyof typeof locationDetails];
  const employees = employeesByLocation[locationId as keyof typeof employeesByLocation] || [];

  const handleEmployeeClick = (employeeId: string) => {
    navigate(`/admin/employee/${employeeId}`);
  };

  const getPositionIcon = (position: string) => {
    if (position.toLowerCase().includes('chef')) return <ChefHat className="w-4 h-4" />;
    if (position.toLowerCase().includes('serveur') || position.toLowerCase().includes('serveuse')) return <Utensils className="w-4 h-4" />;
    if (position.toLowerCase().includes('barista')) return <Coffee className="w-4 h-4" />;
    return <UserCircle className="w-4 h-4" />;
  };

  const activeEmployees = employees.filter(emp => emp.workingNow).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{location?.name}</h1>
            <p className="text-white/90 text-sm md:text-base">
              {location?.address}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{employees.length}</p>
                <p className="text-sm text-muted-foreground">Employés Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-restaurant-green/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-restaurant-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeEmployees}</p>
                <p className="text-sm text-muted-foreground">En Service</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-restaurant-red/10 rounded-xl flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-restaurant-red" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{employees.length - activeEmployees}</p>
                <p className="text-sm text-muted-foreground">Hors Service</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees List */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Équipe {location?.name}
          </CardTitle>
          <CardDescription>
            Cliquez sur un employé pour voir ses détails complets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="border border-border rounded-xl p-6 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => handleEmployeeClick(employee.id)}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={employee.photo} />
                      <AvatarFallback className="bg-gradient-castle text-white">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {employee.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        {getPositionIcon(employee.position)}
                        <span className="truncate">{employee.position}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={employee.workingNow ? "default" : "outline"}>
                      {employee.workingNow ? "En Service" : "Hors Service"}
                    </Badge>
                    {employee.workingNow && (
                      <div className="text-xs text-muted-foreground">
                        Depuis {employee.startTime}
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full btn-restaurant group-hover:shadow-soft transition-all"
                    onClick={() => handleEmployeeClick(employee.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir la Fiche
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLocation;