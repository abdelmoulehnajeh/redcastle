import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin, History } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock schedule data
const scheduleData = {
  "2024-01-15": { restaurant: "Le Gourmet", shift: "09:00 - 17:00", status: "confirmed" },
  "2024-01-16": { restaurant: "Bistro Central", shift: "14:00 - 22:00", status: "confirmed" },
  "2024-01-17": { restaurant: "Café du Coin", shift: "08:00 - 16:00", status: "pending" },
  "2024-01-20": { restaurant: "Le Gourmet", shift: "10:00 - 18:00", status: "confirmed" },
  "2024-01-21": { restaurant: "Bistro Central", shift: "15:00 - 23:00", status: "confirmed" },
};

// Mock work history
const workHistory = [
  {
    id: "1",
    date: "2024-01-14",
    restaurant: "Le Gourmet",
    startTime: "09:15",
    endTime: "17:05",
    totalHours: "7h 50min",
    status: "completed"
  },
  {
    id: "2",
    date: "2024-01-13",
    restaurant: "Bistro Central",
    startTime: "14:00",
    endTime: "22:15",
    totalHours: "8h 15min",
    status: "completed"
  },
  {
    id: "3",
    date: "2024-01-12",
    restaurant: "Café du Coin",
    startTime: "08:05",
    endTime: "16:00",
    totalHours: "7h 55min",
    status: "completed"
  },
  {
    id: "4",
    date: "2024-01-11",
    restaurant: "Le Gourmet",
    startTime: "10:30",
    endTime: "18:10",
    totalHours: "7h 40min",
    status: "completed"
  },
  {
    id: "5",
    date: "2024-01-10",
    restaurant: "Bistro Central",
    startTime: "15:00",
    endTime: "23:00",
    totalHours: "8h 00min",
    status: "completed"
  },
];

const Journal = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getScheduleForDate = (date: Date) => {
    const dateKey = formatDate(date);
    return scheduleData[dateKey as keyof typeof scheduleData];
  };

  const hasScheduleForDate = (date: Date) => {
    const dateKey = formatDate(date);
    return scheduleData.hasOwnProperty(dateKey);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-restaurant-green text-white">Confirmé</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">En attente</Badge>;
      case "completed":
        return <Badge className="bg-primary text-primary-foreground">Terminé</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Journal de Travail</h1>
            <p className="text-white/90 text-sm md:text-base">
              Consultez votre planning et l'historique de vos journées de travail
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Planning du Mois
            </CardTitle>
            <CardDescription>
              Cliquez sur une date pour voir les détails du planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className={cn("w-full pointer-events-auto")}
              modifiers={{
                scheduled: (date) => hasScheduleForDate(date),
              }}
              modifiersStyles={{
                scheduled: {
                  backgroundColor: "hsl(var(--primary))",
                  color: "white",
                  fontWeight: "bold",
                },
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-primary rounded mr-2"></div>
                <span>Jours programmés</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Les jours en surbrillance indiquent des services programmés
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Details */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Détails du Planning
            </CardTitle>
            <CardDescription>
              {selectedDate 
                ? `Planning pour le ${selectedDate.toLocaleDateString('fr-FR')}` 
                : "Sélectionnez une date"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate && getScheduleForDate(selectedDate) ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Statut:</span>
                    {getStatusBadge(getScheduleForDate(selectedDate)!.status)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Restaurant:</span>
                    <span className="text-sm">{getScheduleForDate(selectedDate)!.restaurant}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Horaires:</span>
                    <span className="text-sm font-mono">{getScheduleForDate(selectedDate)!.shift}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button className="w-full btn-restaurant">
                    Confirmer la Présence
                  </Button>
                </div>
              </div>
            ) : selectedDate ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucun service programmé pour cette date
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Sélectionnez une date dans le calendrier
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Work History */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            Historique des Journées Travaillées
          </CardTitle>
          <CardDescription>
            Vos dernières journées de travail avec les heures et restaurants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workHistory.map((entry) => (
              <div key={entry.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium">{entry.restaurant}</h4>
                      {getStatusBadge(entry.status)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(entry.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{entry.startTime} - {entry.endTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">{entry.totalHours}</div>
                    <div className="text-xs text-muted-foreground">Temps total</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Journal;