import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users2, Users, LogOut } from "lucide-react";
import boscocareLogo from "@/assets/boscocare-logo.png";
import heroBackground from "@/assets/hero-background.jpg";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user, role, loading, signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Wait for role to be fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-guidance mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Guidance",
      description: "View and schedule guidance activities",
      icon: Shield,
      path: "/guidance",
      color: "guidance",
      buttonText: "Access Guidance"
    },
    {
      title: "Pastoral",
      description: "View pastoral activities and sacraments",
      icon: Users2,
      path: "/pastoral",
      color: "pastoral",
      buttonText: "Access Pastoral"
    },
    {
      title: "Student Application",
      description: "Fill your student information form",
      icon: Users,
      path: "/student-application",
      color: "student",
      buttonText: "Fill Application",
      studentOnly: true
    },
    {
      title: "Student Records",
      description: "View student information",
      icon: Users,
      path: "/student-records",
      adminOnly: true,
      color: "student",
      buttonText: "Access Student Records"
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30 relative">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-5 pointer-events-none"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src={boscocareLogo} alt="Boscocare Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Boscocare</h1>
              <p className="text-xs text-muted-foreground">Pastoral & Guidance System</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowLogoutDialog(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container px-4 py-16 relative z-10">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-3">Welcome to Boscocare</h2>
          <p className="text-muted-foreground">Select your section to continue</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {cards.map((card) => {
            if (card.adminOnly && role !== "admin") return null;
            if (card.studentOnly && role === "admin") return null;
            
            const Icon = card.icon;
            return (
              <Card
                key={card.path}
                className="cursor-pointer transition-all hover:shadow-lg relative overflow-hidden border-t-4"
                style={{ borderTopColor: `hsl(var(--${card.color}))` }}
                onClick={() => navigate(card.path)}
              >
                <CardHeader className="pb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `hsl(var(--${card.color}))` }}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" className="w-full">
                    {card.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Log Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
