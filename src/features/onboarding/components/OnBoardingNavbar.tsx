import { HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export const OnboardingNavbar = () => {
  const { user } = useKindeBrowserClient();

  return (
    <nav className="w-full bg-background border-b border-border px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">K</span>
          </div>
          <span className="font-semibold text-lg text-foreground">Kastamer</span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-6">
          <span className="text-sm text-muted-foreground">
            Login as: <span className="text-foreground">{user?.email}</span>
          </span>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Help Assistance
          </Button>
          
          <LogoutLink>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </LogoutLink>
        </div>
      </div>
    </nav>
  );
};
