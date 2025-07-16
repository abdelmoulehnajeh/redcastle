import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { Calendar, Clock, DollarSign, FileText, TrendingUp, User } from "lucide-react";
import AdminDashboard from "./AdminDashboard";

// Mock data for the chart
const workDaysData = [
  { month: "Jan", days: 22 },
  { month: "Fév", days: 18 },
  { month: "Mar", days: 25 },
  { month: "Avr", days: 20 },
  { month: "Mai", days: 23 },
  { month: "Jun", days: 21 },
];

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("restaurant_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) return null;

  // Show admin dashboard for admin users
  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  const stats = [
    {
      title: "Heures ce mois",
      value: "168h",
      description: "32h cette semaine",
      icon: Clock,
      color: "text-primary"
    },
    {
      title: "Jours travaillés",
      value: "21",
      description: "+2 vs mois dernier",
      icon: Calendar,
      color: "text-secondary"
    },
    {
      title: "Salaire estimé",
      value: "2,450€",
      description: "Basé sur les heures",
      icon: DollarSign,
      color: "text-restaurant-green"
    },
    {
      title: "Performance",
      value: "95%",
      description: "Ponctualité excellente",
      icon: TrendingUp,
      color: "text-primary"
    }
  ];

  return (
    <div className="space-y-4 md:space-y-8 animate-fade-in p-4 md:p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight bg-gradient-castle bg-clip-text text-transparent">
            Tableau de Bord
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">
            Bonjour {user?.username}, voici votre résumé
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-2 sm:p-3 shadow-elegant">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-restaurant-red" />
          <span className="text-xs sm:text-sm font-medium text-foreground">{user?.username}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="dashboard-card hover-scale shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color} flex-shrink-0`} />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
              Jours Travaillés par Mois
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Votre activité des 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ChartContainer
              config={{
                days: {
                  label: "Jours",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[200px] sm:h-[250px] md:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workDaysData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    width={25}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                  />
                  <Bar 
                    dataKey="days" 
                    fill="url(#barGradient)"
                    radius={[3, 3, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
              Actions Rapides
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Accès rapide aux fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
            <Button className="w-full justify-start h-10 sm:h-12 btn-restaurant text-sm sm:text-base shadow-soft">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Démarrer Pointeuse
            </Button>
            <Button className="w-full justify-start h-10 sm:h-12 btn-secondary-restaurant text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Voir Planning
            </Button>
            <Button className="w-full justify-start h-10 sm:h-12 btn-secondary-restaurant text-sm sm:text-base">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Consulter Salaire
            </Button>
            <Button className="w-full justify-start h-10 sm:h-12 btn-secondary-restaurant text-sm sm:text-base">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Voir Contrat
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;