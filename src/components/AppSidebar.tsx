import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  DollarSign, 
  FileText,
  ChefHat 
} from "lucide-react";

const employeeMenuItems = [
  {
    title: "Tableau de Bord",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Vue d'ensemble"
  },
  {
    title: "Pointeuse",
    url: "/pointeuse",
    icon: Clock,
    description: "Gestion du temps"
  },
  {
    title: "Journal",
    url: "/journal",
    icon: Calendar,
    description: "Planning et historique"
  },
  {
    title: "Finance",
    url: "/finance",
    icon: DollarSign,
    description: "Salaire et infractions"
  },
  {
    title: "Contrats",
    url: "/contrats",
    icon: FileText,
    description: "Détails contractuels"
  },
];

const adminMenuItems = [
  {
    title: "Tableau de Bord",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Vue d'ensemble"
  },
  {
    title: "Journal",
    url: "/admin/journal",
    icon: Calendar,
    description: "Gestion des plannings"
  },
];

const managerMenuItems = [
  {
    title: "Tableau de Bord",
    url: "/manager/dashboard",
    icon: LayoutDashboard,
    description: "Vue d'ensemble"
  },
  {
    title: "Pointeuse",
    url: "/manager/pointeuse",
    icon: Clock,
    description: "Gestion tenues et temps"
  },
  {
    title: "Journal",
    url: "/manager/journal",
    icon: Calendar,
    description: "Planning employés"
  },
  {
    title: "Finance",
    url: "/manager/finance",
    icon: DollarSign,
    description: "Salaires et finances"
  },
  {
    title: "Contrats",
    url: "/manager/contrats",
    icon: FileText,
    description: "Gestion contrats"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("restaurant_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const isActive = (path: string) => currentPath === path;
  const menuItems = user?.role === "admin" ? adminMenuItems : 
                   user?.role === "manager" ? managerMenuItems : 
                   employeeMenuItems;

  return (
    <Sidebar className={`${collapsed ? "w-14 md:w-16" : "w-64 md:w-72"} transition-all duration-300`} collapsible="icon">
      <SidebarContent className="bg-card/95 backdrop-blur-sm border-r border-border shadow-elegant">
        {/* Logo/Brand */}
        <div className="p-3 md:p-6 border-b border-border/50">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-castle rounded-xl flex items-center justify-center shadow-soft">
              <ChefHat className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold text-foreground bg-gradient-castle bg-clip-text text-transparent truncate">Red Castle</h1>
                <p className="text-xs text-muted-foreground truncate">Espace Employé</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="py-2">
          <SidebarGroupLabel className="px-3 md:px-6 py-2 text-xs font-semibold text-restaurant-red uppercase tracking-wider">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="px-2 md:px-3">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`
                      h-10 md:h-12 rounded-xl transition-all duration-200 group
                      ${isActive(item.url) 
                        ? 'bg-gradient-castle text-white shadow-elegant border-0' 
                        : 'hover:bg-accent/80 text-muted-foreground hover:text-foreground hover:shadow-soft'
                      }
                    `}
                  >
                    <NavLink to={item.url} className="flex items-center px-2 md:px-3">
                      <item.icon className={`
                        w-4 h-4 md:w-5 md:h-5 transition-all duration-200 flex-shrink-0
                        ${collapsed ? 'mx-auto' : 'mr-2 md:mr-3'}
                        ${isActive(item.url) ? 'scale-110 text-white' : 'group-hover:scale-105'}
                      `} />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="text-xs md:text-sm font-medium truncate">{item.title}</div>
                          <div className="text-xs opacity-70 truncate hidden md:block">{item.description}</div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}