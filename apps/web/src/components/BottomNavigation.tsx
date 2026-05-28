import { NavLink } from "react-router-dom";
import { Home, BookOpen, Plus, User, ClipboardList } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/log", icon: ClipboardList, label: "Log" },
  { to: "/add-food", icon: Plus, label: "Add", primary: true },
  { to: "/recipes", icon: BookOpen, label: "Recipes" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 pb-safe z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label, primary }) => (
          <NavLink key={to} to={to} end={to === "/"} className="flex-1">
            {({ isActive }) =>
              primary ? (
                <div className="flex flex-col items-center justify-center gap-0.5 h-full">
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all active:scale-95",
                      isActive
                        ? "bg-primary-700"
                        : "bg-gradient-to-br from-primary-500 to-primary-600"
                    )}
                  >
                    <Icon size={22} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span
                    className={clsx(
                      "text-[10px] font-semibold",
                      isActive ? "text-primary-700" : "text-primary-600"
                    )}
                  >
                    {label}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-0.5 h-full">
                  <div
                    className={clsx(
                      "flex items-center justify-center w-10 h-6 rounded-full transition-colors",
                      isActive ? "bg-primary-100" : ""
                    )}
                  >
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.2 : 1.75}
                      className={clsx(
                        "transition-colors",
                        isActive ? "text-primary-600" : "text-gray-400"
                      )}
                    />
                  </div>
                  <span
                    className={clsx(
                      "text-[10px] font-medium transition-colors",
                      isActive ? "text-primary-600" : "text-gray-400"
                    )}
                  >
                    {label}
                  </span>
                </div>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
