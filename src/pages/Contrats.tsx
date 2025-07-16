import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  User,
  Download,
  Eye
} from "lucide-react";

// Mock contract data
const contractData = {
  contractNumber: "CTR-2024-0156",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  status: "active",
  type: "CDI",
  position: "Serveur / Serveuse",
  hourlyRate: 13.5,
  weeklyHours: 35,
  restaurants: [
    { name: "Restaurant Le Gourmet", address: "123 Rue de la Paix, 75001 Paris" },
    { name: "Bistro Central", address: "456 Avenue des Champs, 75008 Paris" },
    { name: "Café du Coin", address: "789 Boulevard Saint-Michel, 75005 Paris" }
  ],
  benefits: [
    "Tickets restaurant (8€/jour)",
    "Mutuelle d'entreprise (50% prise en charge)",
    "2 semaines de congés supplémentaires",
    "Formation continue",
    "Prime de performance trimestrielle"
  ],
  workingConditions: {
    shiftTypes: ["Matin", "Après-midi", "Soirée"],
    maxConsecutiveDays: 6,
    restPeriod: "11h minimum entre deux services",
    overtime: "Majoration de 25% après 35h/semaine"
  }
};

const Contrats = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-restaurant-green text-white">Actif</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">En attente</Badge>;
      case "expired":
        return <Badge variant="outline" className="border-red-500 text-red-600">Expiré</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getContractTypeBadge = (type: string) => {
    switch (type) {
      case "CDI":
        return <Badge className="bg-primary text-primary-foreground">CDI</Badge>;
      case "CDD":
        return <Badge variant="outline" className="border-primary text-primary">CDD</Badge>;
      case "Interim":
        return <Badge variant="outline">Intérim</Badge>;
      default:
        return <Badge variant="secondary">Autre</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Contrats</h1>
            <p className="text-white/90 text-sm md:text-base">
              Consultez les détails de votre contrat de travail
            </p>
          </div>
        </div>
      </div>

      {/* Contract Overview */}
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Contrat Principal
              </CardTitle>
              <CardDescription className="mt-1">
                Contrat N° {contractData.contractNumber}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {getStatusBadge(contractData.status)}
              {getContractTypeBadge(contractData.type)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations Générales</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Poste:</span>
                  <span className="font-medium">{contractData.position}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Période:</span>
                  <span className="font-medium">
                    {new Date(contractData.startDate).toLocaleDateString('fr-FR')} - 
                    {new Date(contractData.endDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Taux horaire:</span>
                  <span className="font-medium text-primary">{contractData.hourlyRate}€/heure</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Temps de travail:</span>
                  <span className="font-medium">{contractData.weeklyHours}h/semaine</span>
                </div>
              </div>
            </div>

            {/* Working Conditions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Conditions de Travail</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Types de services:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contractData.workingConditions.shiftTypes.map((shift) => (
                      <Badge key={shift} variant="outline" className="text-xs">
                        {shift}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Jours consécutifs max:</span>
                  <span className="ml-2 font-medium">{contractData.workingConditions.maxConsecutiveDays} jours</span>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Repos entre services:</span>
                  <span className="ml-2 font-medium">{contractData.workingConditions.restPeriod}</span>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Heures supplémentaires:</span>
                  <span className="ml-2 font-medium">{contractData.workingConditions.overtime}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button className="btn-restaurant">
              <Download className="w-4 h-4 mr-2" />
              Télécharger le Contrat
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Voir les Annexes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Restaurants Assignés
          </CardTitle>
          <CardDescription>
            Lieux de travail selon votre contrat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractData.restaurants.map((restaurant, index) => (
              <div key={index} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <h4 className="font-medium mb-2">{restaurant.name}</h4>
                <p className="text-sm text-muted-foreground">{restaurant.address}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Avantages et Bénéfices
          </CardTitle>
          <CardDescription>
            Avantages inclus dans votre contrat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contractData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                <div className="w-2 h-2 bg-restaurant-green rounded-full"></div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contrats;