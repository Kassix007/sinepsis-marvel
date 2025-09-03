import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, BarChart3, Calendar, FileSpreadsheet } from "lucide-react";

interface ExportPanelProps {
  selectedDepartment: string;
}

export const ExportPanel = ({ selectedDepartment }: ExportPanelProps) => {
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting ${selectedDepartment} data in ${format} format`);
    
    // TODO: Implement actual export functionality
    switch (format) {
      case 'csv':
        // Export as CSV
        console.log('Exporting as CSV...');
        break;
      case 'excel':
        // Export as Excel (.xlsx)
        console.log('Exporting as Excel...');
        break;
      case 'pdf':
        // Export as PDF
        console.log('Exporting as PDF...');
        break;
    }
  };

    return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm w-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-sm flex-shrink-0">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-foreground">Export Data</span>
            <span className="text-sm text-muted-foreground">
              {selectedDepartment === "all" ? "All departments" : selectedDepartment}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport("csv")}
            className="h-8 px-3 text-sm font-medium border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 flex-shrink-0"
          >
            <FileText className="h-4 w-4 mr-2" />
            CSV
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport("excel")}
            className="h-8 px-3 text-sm font-medium border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 flex-shrink-0"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport("pdf")}
            className="h-8 px-3 text-sm font-medium border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 flex-shrink-0"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
