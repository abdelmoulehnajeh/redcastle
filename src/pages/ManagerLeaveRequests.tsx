import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const leaveTypes = {
  annual: "Congé Annuel",
  sick: "Congé Maladie",
  maternity: "Congé Maternité",
  emergency: "Congé d'Urgence",
  other: "Autre"
};

const mockRequests = [
  {
    id: "req_001",
    employeeId: "emp_001",
    employeeName: "Ahmed Ben Ali",
    type: "annual",
    startDate: "2024-01-15",
    endDate: "2024-01-20",
    days: 5,
    status: "pending",
    reason: "Vacances familiales",
    submittedAt: "2024-01-10"
  },
  {
    id: "req_002",
    employeeId: "emp_002",
    employeeName: "Fatma Triki",
    type: "sick",
    startDate: "2024-01-12",
    endDate: "2024-01-14",
    days: 3,
    status: "pending",
    reason: "Grippe saisonnière",
    submittedAt: "2024-01-11"
  },
  {
    id: "req_003",
    employeeId: "emp_003",
    employeeName: "Mohamed Sassi",
    type: "emergency",
    startDate: "2024-01-08",
    endDate: "2024-01-08",
    days: 1,
    status: "approved",
    reason: "Urgence familiale",
    submittedAt: "2024-01-07"
  },
];

const ManagerLeaveRequests = () => {
  const [requests, setRequests] = useState(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const { toast } = useToast();

  const handleDecision = (requestId: string, decision: "approved" | "rejected") => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: "pending_admin" } : req
      )
    );

    const action = decision === "approved" ? "approuvée" : "rejetée";
    toast({
      title: `Demande ${action}`,
      description: `La demande a été ${action} et envoyée à l'administrateur pour approbation finale`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />En Attente</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-600"><Check className="w-3 h-3 mr-1" />Approuvé</Badge>;
      case "rejected":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rejeté</Badge>;
      default:
        return null;
    }
  };

  const pendingRequests = requests.filter(req => req.status === "pending");
  const processedRequests = requests.filter(req => req.status !== "pending");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Demandes de Congé</h1>
        <p className="text-white/90">Gérez les demandes de congé des employés</p>
      </div>

      {/* Pending Requests */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Demandes en Attente ({pendingRequests.length})
          </CardTitle>
          <CardDescription>Demandes nécessitant votre attention</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucune demande en attente</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border border-border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {request.employeeName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{request.employeeName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {leaveTypes[request.type as keyof typeof leaveTypes]} • {request.days} jour(s)
                        </p>
                        <p className="text-sm font-medium">
                          {request.startDate} → {request.endDate}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Détails de la Demande</DialogTitle>
                            <DialogDescription>
                              Demande de {selectedRequest?.employeeName}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedRequest && (
                            <div className="space-y-4">
                              <div>
                                <p className="font-medium">Type: {leaveTypes[selectedRequest.type as keyof typeof leaveTypes]}</p>
                                <p className="font-medium">Période: {selectedRequest.startDate} → {selectedRequest.endDate}</p>
                                <p className="font-medium">Durée: {selectedRequest.days} jour(s)</p>
                                <p className="font-medium">Soumise le: {selectedRequest.submittedAt}</p>
                              </div>
                              <div>
                                <p className="font-medium mb-1">Motif:</p>
                                <p className="text-sm bg-muted p-3 rounded">{selectedRequest.reason}</p>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => handleDecision(selectedRequest?.id, "rejected")}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Rejeter
                            </Button>
                            <Button onClick={() => handleDecision(selectedRequest?.id, "approved")}>
                              <Check className="w-4 h-4 mr-1" />
                              Approuver
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDecision(request.id, "rejected")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleDecision(request.id, "approved")}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Demandes Traitées</CardTitle>
          <CardDescription>Historique des demandes approuvées ou rejetées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processedRequests.map((request) => (
              <div key={request.id} className="border border-border rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {request.employeeName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{request.employeeName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {leaveTypes[request.type as keyof typeof leaveTypes]} • {request.days} jour(s)
                      </p>
                      <p className="text-sm font-medium">
                        {request.startDate} → {request.endDate}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerLeaveRequests;