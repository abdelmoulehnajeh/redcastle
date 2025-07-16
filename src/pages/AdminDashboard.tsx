import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Users, 
  Building2, 
  Clock,
  Eye,
  ChefHat,
  UserCircle
} from "lucide-react";

const locations = [
  {
    id: "auina",
    name: "Auina",
    address: "123 Rue Auina, Tunis",
    employeeCount: 12,
    description: "Restaurant principal"
  },
  {
    id: "el-manzah",
    name: "El Manzah",
    address: "456 Avenue El Manzah, Tunis",
    employeeCount: 8,
    description: "Succursale moderne"
  },
  {
    id: "cuisine-centrale",
    name: "Cuisine Centrale",
    address: "789 Zone Industrielle, Tunis",
    employeeCount: 15,
    description: "Centre de production"
  }
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLocationClick = (locationId: string) => {
    navigate(`/admin/location/${locationId}`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Administration Red Castle</h1>
            <p className="text-white/90 text-sm md:text-base">
              Gérez vos restaurants et vos équipes
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">Restaurants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-restaurant-green/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-restaurant-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">35</p>
                <p className="text-sm text-muted-foreground">Employés Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-restaurant-red/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-restaurant-red" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">28</p>
                <p className="text-sm text-muted-foreground">En Service</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Restaurants & Équipes
          </CardTitle>
          <CardDescription>
            Cliquez sur un restaurant pour voir ses employés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((location) => (
              <div
                key={location.id}
                className="border border-border rounded-xl p-6 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => handleLocationClick(location.id)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-castle rounded-xl flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {location.employeeCount} employés
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                      {location.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {location.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      {location.address}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full btn-restaurant group-hover:shadow-soft transition-all"
                    onClick={() => handleLocationClick(location.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir les Employés
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

export default AdminDashboard;