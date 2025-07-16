import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const leaveTypes = [
  { value: "annual", label: "Congé Annuel" },
  { value: "sick", label: "Congé Maladie" },
  { value: "maternity", label: "Congé Maternité" },
  { value: "emergency", label: "Congé d'Urgence" },
  { value: "other", label: "Autre" },
];

const mockRequests = [
  { 
    id: "req_001", 
    type: "annual", 
    startDate: "2024-01-15", 
    endDate: "2024-01-20", 
    days: 5, 
    status: "pending",
    reason: "Vacances familiales"
  },
  { 
    id: "req_002", 
    type: "sick", 
    startDate: "2024-01-10", 
    endDate: "2024-01-12", 
    days: 2, 
    status: "approved",
    reason: "Grippe"
  },
];

const LeaveRequest = () => {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const calculateDays = () => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const handleSubmit = () => {
    if (!leaveType || !startDate || !endDate || !reason) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Demande envoyée",
      description: `Demande de congé ${leaveTypes.find(t => t.value === leaveType)?.label} envoyée au manager`
    });

    // Reset form
    setLeaveType("");
    setStartDate(undefined);
    setEndDate(undefined);
    setReason("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />En Attente</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approuvé</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeté</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Demande de Congé</h1>
        <p className="text-white/90">Gérez vos demandes de congé de travail</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Request Form */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Nouvelle Demande</CardTitle>
            <CardDescription>Soumettez une demande de congé</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leave-type">Type de Congé</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de Début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Date de Fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {startDate && endDate && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Durée: {calculateDays()} jour(s)</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Motif</Label>
              <Textarea
                id="reason"
                placeholder="Expliquez le motif de votre demande..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Envoyer la Demande
            </Button>
          </CardContent>
        </Card>

        {/* Request History */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Historique des Demandes</CardTitle>
            <CardDescription>Vos demandes précédentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRequests.map((request) => (
                <div key={request.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">
                        {leaveTypes.find(t => t.value === request.type)?.label}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {request.startDate} → {request.endDate} ({request.days} jours)
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm">{request.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaveRequest;