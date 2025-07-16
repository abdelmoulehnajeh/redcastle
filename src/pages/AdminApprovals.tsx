import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock, FileText, Calendar, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PendingApproval {
  id: string;
  type: "leave_request" | "schedule_change" | "contract_update";
  managerAction: string;
  employeeName: string;
  details: any;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

const mockApprovals: PendingApproval[] = [
  {
    id: "app_001",
    type: "leave_request",
    managerAction: "Approved",
    employeeName: "Ahmed Ben Ali",
    details: {
      type: "annual",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      days: 5,
      reason: "Vacances familiales"
    },
    submittedAt: "2024-01-10",
    status: "pending"
  },
  {
    id: "app_002",
    type: "schedule_change",
    managerAction: "Updated Schedule",
    employeeName: "Fatma Triki",
    details: {
      days: ["Lundi", "Mardi", "Mercredi"],
      shifts: ["Matin", "Soirée", "Doublage"],
      job: "Serveur"
    },
    submittedAt: "2024-01-11",
    status: "pending"
  },
  {
    id: "app_003",
    type: "contract_update",
    managerAction: "Contract Modified",
    employeeName: "Mohamed Sassi",
    details: {
      salary: "1200 DT",
      tenuCount: 3,
      documents: ["Contrat.pdf"]
    },
    submittedAt: "2024-01-12",
    status: "pending"
  }
];

const AdminApprovals = () => {
  const [approvals, setApprovals] = useState(mockApprovals);
  const { toast } = useToast();

  const handleDecision = (approvalId: string, decision: "approved" | "rejected") => {
    setApprovals(prev =>
      prev.map(approval =>
        approval.id === approvalId ? { ...approval, status: decision } : approval
      )
    );

    const action = decision === "approved" ? "approuvée" : "rejetée";
    toast({
      title: `Demande ${action}`,
      description: `L'action du manager a été ${action}`
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "leave_request":
        return <Calendar className="w-4 h-4" />;
      case "schedule_change":
        return <Users className="w-4 h-4" />;
      case "contract_update":
        return <FileText className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "leave_request":
        return "Demande de Congé";
      case "schedule_change":
        return "Modification Planning";
      case "contract_update":
        return "Mise à jour Contrat";
      default:
        return "Action";
    }
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

  const pendingApprovals = approvals.filter(app => app.status === "pending");
  const processedApprovals = approvals.filter(app => app.status !== "pending");

  const renderDetails = (approval: PendingApproval) => {
    switch (approval.type) {
      case "leave_request":
        return (
          <div className="text-sm text-muted-foreground">
            <p>Type: {approval.details.type} • {approval.details.days} jour(s)</p>
            <p>Période: {approval.details.startDate} → {approval.details.endDate}</p>
            <p>Motif: {approval.details.reason}</p>
          </div>
        );
      case "schedule_change":
        return (
          <div className="text-sm text-muted-foreground">
            <p>Jours: {approval.details.days.join(", ")}</p>
            <p>Horaires: {approval.details.shifts.join(", ")}</p>
            <p>Poste: {approval.details.job}</p>
          </div>
        );
      case "contract_update":
        return (
          <div className="text-sm text-muted-foreground">
            <p>Salaire: {approval.details.salary}</p>
            <p>Tenues: {approval.details.tenuCount}</p>
            <p>Documents: {approval.details.documents.join(", ")}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Approbations Manager</h1>
        <p className="text-white/90">Approuvez ou rejetez les actions des managers</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            En Attente ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="processed">
            Traitées ({processedApprovals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Approbations en Attente
              </CardTitle>
              <CardDescription>Actions des managers nécessitant votre approbation</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Aucune approbation en attente</p>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="border border-border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {approval.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getTypeIcon(approval.type)}
                              <h4 className="font-semibold">{getTypeLabel(approval.type)}</h4>
                            </div>
                            <p className="font-medium">{approval.employeeName}</p>
                            <p className="text-sm text-muted-foreground mb-2">
                              Action Manager: {approval.managerAction}
                            </p>
                            {renderDetails(approval)}
                            <p className="text-xs text-muted-foreground mt-2">
                              Soumis le: {approval.submittedAt}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDecision(approval.id, "rejected")}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Rejeter
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleDecision(approval.id, "approved")}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approuver
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processed">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Approbations Traitées</CardTitle>
              <CardDescription>Historique des approbations et rejets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedApprovals.map((approval) => (
                  <div key={approval.id} className="border border-border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {approval.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeIcon(approval.type)}
                            <h4 className="font-semibold">{getTypeLabel(approval.type)}</h4>
                          </div>
                          <p className="font-medium">{approval.employeeName}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Action Manager: {approval.managerAction}
                          </p>
                          {renderDetails(approval)}
                        </div>
                      </div>
                      {getStatusBadge(approval.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminApprovals;