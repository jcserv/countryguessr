import { useState } from "react";

import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart2,
  Gamepad2,
  Github,
  Menu,
  Moon,
  Sun,
} from "lucide-react";

import { ModeToggle } from "@/components";
import { useTheme } from "@/components/theme-provider";
import { TimerDisplay } from "@/components/TimerDisplay";
import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isMainRoute = location.pathname === "/";
  const isStatsRoute = location.pathname === "/stats";

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="w-4 h-4" />;
    if (theme === "dark") return <Moon className="w-4 h-4" />;
    return (
      <>
        <Sun className="w-4 h-4" />
        <span>/</span>
        <Moon className="w-4 h-4" />
      </>
    );
  };

  const getThemeLabel = () => {
    if (theme === "light") return "Light";
    if (theme === "dark") return "Dark";
    return "System";
  };

  return (
    <header className="flex justify-between items-center gap-2 px-2 md:px-4 py-2 md:py-4 overflow-hidden">
      <h1 className="font-extrabold text-xl sm:text-2xl md:text-4xl lg:text-5xl tracking-tight scroll-m-20 shrink-0">
        <Link to="/">🌎 CountryGuessr</Link>
      </h1>
      <div>
        <TimerDisplay />
      </div>
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        {/* Desktop navigation */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2">
          {!isMainRoute && (
            <Link
              to="/"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <Gamepad2 className="w-4 h-4" />
              Play
            </Link>
          )}
          {!isStatsRoute && (
            <Link
              to="/stats"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <BarChart2 className="w-4 h-4" />
              Stats
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
            onClick={() => {
              window.open("https://github.com/jcserv/countryguessr", "_blank");
            }}
          >
            <Github className="w-4 h-4" />
          </Button>
          <ModeToggle />
        </div>

        {/* Mobile hamburger button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden p-2"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Mobile menu dialog */}
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle>Menu</DialogTitle>
            </DialogHeader>
            <nav className="flex flex-col gap-2">
              {!isMainRoute && (
                <Link
                  to="/"
                  className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Gamepad2 className="w-4 h-4" />
                  Play
                </Link>
              )}
              {!isStatsRoute && (
                <Link
                  to="/stats"
                  className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart2 className="w-4 h-4" />
                  Stats
                </Link>
              )}
              <button
                className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-md text-left"
                onClick={cycleTheme}
              >
                {getThemeIcon()}
                Theme: {getThemeLabel()}
              </button>
              <button
                className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-md text-left"
                onClick={() => {
                  window.open(
                    "https://github.com/jcserv/countryguessr",
                    "_blank",
                  );
                  setMobileMenuOpen(false);
                }}
              >
                <Github className="w-4 h-4" />
                GitHub
              </button>
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};
