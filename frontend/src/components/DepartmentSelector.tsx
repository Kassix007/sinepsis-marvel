import { Button } from "@/components/ui/button";
import { Building2, ChevronDown } from "lucide-react";
import { useState } from "react";

interface DepartmentSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  departments: string[];
}

export const DepartmentSelector = ({ 
  value, 
  onValueChange, 
  departments 
}: DepartmentSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getDisplayValue = () => {
    if (value === "all") return `All Departments (${departments.length + 1})`;
    return value;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm w-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-sm flex-shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-foreground">Department Filter</span>
            <span className="text-sm text-muted-foreground">Select department to view</span>
          </div>
        </div>
        
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full h-10 justify-between text-left font-normal border-border hover:bg-muted hover:border-primary/50"
          >
            <span className="truncate">{getDisplayValue()}</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              <div className="p-1">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onValueChange("all");
                    setIsOpen(false);
                  }}
                  className={`w-full justify-start h-9 px-3 text-sm ${
                    value === "all" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  All Departments
                  <span className="ml-auto text-xs text-muted-foreground">({departments.length + 1})</span>
                </Button>
                
                {departments.map((dept) => (
                  <Button
                    key={dept}
                    variant="ghost"
                    onClick={() => {
                      onValueChange(dept);
                      setIsOpen(false);
                    }}
                    className={`w-full justify-start h-9 px-3 text-sm ${
                      value === dept ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    {dept}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
