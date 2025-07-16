import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Lock, User } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre nom d'utilisateur et mot de passe",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        const userData = {
          username: "admin",
          role: "admin",
          id: "admin_001",
          isAuthenticated: true,
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem("restaurant_user", JSON.stringify(userData));
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans votre espace d'administration"
        });
        
        navigate("/dashboard");
      } else if (username === "manager" && password === "manager") {
        const userData = {
          username: "manager",
          role: "manager",
          id: "manager_001",
          isAuthenticated: true,
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem("restaurant_user", JSON.stringify(userData));
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans votre espace de gestion"
        });
        
        navigate("/manager/dashboard");
      } else if (username && password) {
        // Regular employee login
        const userData = {
          username: username,
          role: "employee",
          id: `emp_${Date.now()}`,
          isAuthenticated: true,
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem("restaurant_user", JSON.stringify(userData));
        
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${username}`
        });
        
        navigate("/dashboard");
      } else {
        toast({
          title: "Erreur de connexion",
          description: "Nom d'utilisateur ou mot de passe incorrect",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-[var(--shadow-elevated)] border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 bg-gradient-restaurant rounded-full flex items-center justify-center mb-4 animate-pulse-glow">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Tableau de Bord Restaurant
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Connectez-vous à votre espace employé
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Nom d'utilisateur
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Entrez votre nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 border-border focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-border focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 btn-restaurant text-lg font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Utilisez vos identifiants fournis par l'administration</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;