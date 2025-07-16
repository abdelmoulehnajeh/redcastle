import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Play, 
  Square, 
  MapPin, 
  Timer,
  Calendar as CalendarIcon
} from "lucide-react";

const restaurants = [
  { id: "rest1", name: "Restaurant Le Gourmet", address: "123 Rue de la Paix" },
  { id: "rest2", name: "Bistro Central", address: "456 Avenue des Champs" },
  { id: "rest3", name: "Café du Coin", address: "789 Boulevard Saint-Michel" },
];

interface TimeSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  restaurant: string;
  duration?: string;
}

const Pointeuse = () => {
  const [isWorking, setIsWorking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [workDuration, setWorkDuration] = useState("00:00:00");
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const { toast } = useToast();

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Update work duration if working
      if (isWorking && workStartTime) {
        const duration = new Date().getTime() - workStartTime.getTime();
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((duration % (1000 * 60)) / 1000);
        setWorkDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorking, workStartTime]);

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("work_sessions");
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  const handleStart = () => {
    if (!selectedRestaurant) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un restaurant",
        variant: "destructive"
      });
      return;
    }

    const startTime = new Date();
    setIsWorking(true);
    setWorkStartTime(startTime);
    setWorkDuration("00:00:00");

    toast({
      title: "Pointage démarré",
      description: `Début du travail chez ${restaurants.find(r => r.id === selectedRestaurant)?.name}`,
    });
  };

  const handleStop = () => {
    if (!workStartTime) return;

    const endTime = new Date();
    const duration = endTime.getTime() - workStartTime.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    const newSession: TimeSession = {
      id: Date.now().toString(),
      startTime: workStartTime,
      endTime,
      restaurant: restaurants.find(r => r.id === selectedRestaurant)?.name || "",
      duration: `${hours}h ${minutes}min`
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem("work_sessions", JSON.stringify(updatedSessions));

    setIsWorking(false);
    setWorkStartTime(null);
    setWorkDuration("00:00:00");

    toast({
      title: "Pointage terminé",
      description: `Travail terminé après ${newSession.duration}`,
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Pointeuse</h1>
            <p className="text-white/90 text-sm md:text-base">
              Gérez votre temps de travail et suivez vos heures
            </p>
          </div>
        </div>
      </div>

      {/* Current Time Card */}
      <Card className="time-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Clock className="w-6 h-6 mr-3 text-primary" />
              Heure Actuelle
            </span>
            <Badge variant={isWorking ? "default" : "secondary"} className="text-sm">
              {isWorking ? "En Service" : "Hors Service"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold text-primary">
              {formatTime(currentTime)}
            </div>
            <div className="text-lg text-muted-foreground">
              {formatDate(currentTime)}
            </div>
            
            {isWorking && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Temps de travail:</p>
                <div className="text-2xl font-mono font-bold text-secondary animate-pulse-glow">
                  {workDuration}
                </div>
                <p className="text-sm text-muted-foreground">
                  Chez {restaurants.find(r => r.id === selectedRestaurant)?.name}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="w-5 h-5 mr-2" />
              Contrôles de Pointage
            </CardTitle>
            <CardDescription>
              Démarrez ou arrêtez votre service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Restaurant:</label>
              <Select 
                value={selectedRestaurant} 
                onValueChange={setSelectedRestaurant}
                disabled={isWorking}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <div>
                          <div className="font-medium">{restaurant.name}</div>
                          <div className="text-xs text-muted-foreground">{restaurant.address}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3">
              {!isWorking ? (
                <Button 
                  onClick={handleStart}
                  className="flex-1 h-12 btn-restaurant"
                  disabled={!selectedRestaurant}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Démarrer le Service
                </Button>
              ) : (
                <Button 
                  onClick={handleStop}
                  className="flex-1 h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Arrêter le Service
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Sessions Récentes
            </CardTitle>
            <CardDescription>
              Vos dernières sessions de travail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune session enregistrée
                </p>
              ) : (
                sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="border border-border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{session.restaurant}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(session.startTime)} • {formatTime(session.startTime)} - {session.endTime ? formatTime(session.endTime) : 'En cours'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {session.duration}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pointeuse;