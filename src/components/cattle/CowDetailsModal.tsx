import { X, Phone, Mail, MapPin, Edit, Trash2, FileText, Eye, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CowDetailsModalProps {
  open: boolean;
  onClose: () => void;
  cow?: {
    tag: string;
    breed: string;
    color: string;
    age: number;
    status: string;
    registeredDate: string;
    owner: {
      name: string;
      phone: string;
      email: string;
      address: string;
      nationalId: string;
    };
    nosePrints: Array<{
      angle: string;
      quality: number;
      image: string;
    }>;
  };
}

export const CowDetailsModal = ({ open, onClose, cow }: CowDetailsModalProps) => {
  if (!cow) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                🐄 {cow.tag}
                <Badge variant="outline" className="bg-success/10 text-success">
                  {cow.status}
                </Badge>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Registered: {cow.registeredDate}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-3 mt-4">
          {/* Cattle Information */}
          <div className="space-y-4 p-4 rounded-lg border bg-card">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              🐄 Cattle Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Tag:</span>
                <p className="font-mono font-semibold text-primary">{cow.tag}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Breed:</span>
                <p className="font-medium">{cow.breed}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Color:</span>
                <p className="font-medium">{cow.color}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Age:</span>
                <p className="font-medium">{cow.age} years</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge className="bg-success/10 text-success mt-1">Active</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Registered:</span>
                <p className="font-medium">{cow.registeredDate}</p>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="space-y-4 p-4 rounded-lg border bg-card">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              👤 Owner Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-lg">{cow.owner.name}</p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{cow.owner.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="break-all">{cow.owner.email}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>{cow.owner.address}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ID:</span>
                <p className="font-mono text-xs mt-1">{cow.owner.nationalId}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 p-4 rounded-lg border bg-card">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              ⚡ Quick Actions
            </h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Transfer Ownership
              </Button>
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Verify Nose Print
              </Button>
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View History
              </Button>
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
              <Button variant="destructive" className="w-full justify-start" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Cow
              </Button>
            </div>
          </div>
        </div>

        {/* Nose Print Gallery */}
        <div className="mt-6 p-4 rounded-lg border bg-card">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            📸 Registered Nose Prints
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {cow.nosePrints.map((print, index) => (
              <div key={index} className="space-y-2">
                <div className="aspect-square rounded-lg bg-muted/50 border-2 border-border flex items-center justify-center">
                  <span className="text-4xl">📸</span>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{print.angle}</p>
                  <p className="text-xs text-muted-foreground">
                    {print.quality}% Quality
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification History */}
        <div className="mt-6 p-4 rounded-lg border bg-card">
          <h3 className="font-semibold text-lg mb-4">Recent Verifications</h3>
          <div className="space-y-3">
            {[
              { time: "2 hours ago", method: "Nose Print", location: "Kigali Market", result: "Match 97.3%" },
              { time: "1 day ago", method: "Tag Lookup", location: "Musanze Center", result: "Match 100%" },
              { time: "3 days ago", method: "Nose Print", location: "Huye District", result: "Match 95.8%" },
            ].map((verification, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{verification.method}</p>
                  <p className="text-xs text-muted-foreground">{verification.location}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-success/10 text-success">
                    {verification.result}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{verification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
