"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch } from "@/lib/store/hooks";
import { setTheme } from "@/lib/store/slices/userSlice";
import { useAuth } from "@/providers/auth-provider";
import { paths } from "@/utils/paths";
import {
  CircleDotDashed,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { theme, setTheme: setNextTheme } = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const fullName = user?.user_metadata
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    : user?.email;

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    dispatch(setTheme(newTheme));
    setNextTheme(newTheme);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push(paths.home);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="mr-2 h-4 w-4" />;
      case "light":
        return <Sun className="mr-2 h-4 w-4" />;
      default:
        return <Monitor className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 text-gray-400 hover:text-white">
          <Menu className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={paths.profile}>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {getThemeIcon()}
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleThemeChange("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <Link href={paths.home}>
          <DropdownMenuItem>
            <CircleDotDashed className="mr-2 h-4 w-4" />
            <span>Home page</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
