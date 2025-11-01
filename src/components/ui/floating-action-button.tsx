import { useState } from "react";
import { Plus, Beef, FileCheck, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { icon: Beef, label: "Register Cattle", href: "/register", color: "bg-blue-500 hover:bg-blue-600" },
    { icon: FileCheck, label: "Verify Cattle", href: "/verify", color: "bg-green-500 hover:bg-green-600" },
    { icon: AlertCircle, label: "View Reports", href: "/reports", color: "bg-orange-500 hover:bg-orange-600" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col-reverse items-end gap-3">
        {isOpen && actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
              {action.label}
            </span>
            <Button
              size="icon"
              className={`h-12 w-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${action.color}`}
              onClick={() => {
                navigate(action.href);
                setIsOpen(false);
              }}
            >
              <action.icon className="h-5 w-5" />
            </Button>
          </div>
        ))}
        
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-xl transition-all duration-200 hover:scale-110"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6 transition-transform duration-200" />
          ) : (
            <Plus className="h-6 w-6 transition-transform duration-200" />
          )}
        </Button>
      </div>
    </div>
  );
};