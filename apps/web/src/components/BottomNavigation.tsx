import { NavLink } from "react-router-dom";
import { Home, BookOpen, PlusCircle, User, ClipboardList } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/log", icon: ClipboardList, label: "Log" },
  { to: "/add-food", icon: PlusCircle, label: "Add", primary: true },
  { to: "/recipes", icon: BookOpen, label: "Recipes" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 pb-safe z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label, primary }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-xl transition-all",
                primary
                  ? isActive
                    ? "text-primary-600"
                    : "text-primary-500"
                  : isActive
                  ? "text-primary-600"
                  : "text-gray-400"
              )
            }
          >
            <Icon
              size={primary ? 32 : 22}
              strokeWidth={primary ? 2 : 1.75}
              className={primary ? "mb-0" : ""}
            />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
