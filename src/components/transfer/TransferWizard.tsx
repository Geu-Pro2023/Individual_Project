import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface TransferWizardProps {
  open: boolean;
  onClose: () => void;
}

export const TransferWizard = ({ open, onClose }: TransferWizardProps) => {
  const [step, setStep] = useState(1);
  const [selectedCow, setSelectedCow] = useState<any>(null);
  const [newOwner, setNewOwner] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    nationalId: "",
  });
  const [confirmations, setConfirmations] = useState({
    legitimate: false,
    verified: false,
    certificate: false,
  });

  const handleSearch = () => {
    // Mock search result
    setSelectedCow({
      tag: "TW-2025-BWF-0042",
      breed: "Holstein",
      color: "Black & White",
      age: 3,
      currentOwner: {
        name: "John Doe",
        phone: "+250 788 123 456",
      },
    });
  };

  const handleTransfer = () => {
    if (confirmations.legitimate && confirmations.verified && confirmations.certificate) {
      toast.success("Ownership transferred successfully!");
      onClose();
      setStep(1);
    } else {
      toast.error("Please confirm all checkboxes to proceed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Transfer Ownership - Step {step} of 3
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Select Cow */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Select Cattle for Transfer</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter cow tag (e.g., TW-2025-BWF-0042)"
                  className="font-mono"
                  defaultValue="TW-2025-BWF-0042"
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {selectedCow && (
              <div className="p-4 rounded-lg border bg-success/5 border-success">
                <p className="text-sm font-medium text-success mb-2">✅ Selected Cow:</p>
                <div className="space-y-2">
                  <p className="font-mono font-bold text-lg text-primary">
                    {selectedCow.tag}
                  </p>
                  <p className="text-sm">
                    {selectedCow.breed} | {selectedCow.color} | {selectedCow.age} years
                  </p>
                  <p className="text-sm text-muted-foreground">
                    👤 Current Owner: {selectedCow.currentOwner.name} (
                    {selectedCow.currentOwner.phone})
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedCow}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: New Owner Details */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">New Owner Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newOwnerName">Full Name *</Label>
                <Input
                  id="newOwnerName"
                  value={newOwner.name}
                  onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
                  placeholder="Enter new owner's full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newOwnerEmail">Email Address</Label>
                <Input
                  id="newOwnerEmail"
                  type="email"
                  value={newOwner.email}
                  onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                  placeholder="owner@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newOwnerPhone">Phone Number *</Label>
                <Input
                  id="newOwnerPhone"
                  type="tel"
                  value={newOwner.phone}
                  onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                  placeholder="+250 XXX XXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newOwnerAddress">Physical Address *</Label>
                <Input
                  id="newOwnerAddress"
                  value={newOwner.address}
                  onChange={(e) => setNewOwner({ ...newOwner, address: e.target.value })}
                  placeholder="District, Sector, Cell"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newOwnerNationalId">National ID *</Label>
                <Input
                  id="newOwnerNationalId"
                  value={newOwner.nationalId}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, nationalId: e.target.value })
                  }
                  placeholder="1 XXXX X XXXXXXX X XX"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!newOwner.name || !newOwner.phone || !newOwner.address || !newOwner.nationalId}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg border-2 border-warning bg-warning/5">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                ⚠️ OWNERSHIP TRANSFER CONFIRMATION
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Cow:</p>
                  <p className="font-semibold">
                    {selectedCow?.tag} ({selectedCow?.breed}, {selectedCow?.color},{" "}
                    {selectedCow?.age} years)
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground mb-1">FROM:</p>
                    <p className="font-semibold">{selectedCow?.currentOwner.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCow?.currentOwner.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">TO:</p>
                    <p className="font-semibold">{newOwner.name}</p>
                    <p className="text-xs text-muted-foreground">{newOwner.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="legitimate"
                  checked={confirmations.legitimate}
                  onCheckedChange={(checked) =>
                    setConfirmations({ ...confirmations, legitimate: !!checked })
                  }
                />
                <label htmlFor="legitimate" className="text-sm font-medium cursor-pointer">
                  I confirm this ownership transfer is legitimate
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={confirmations.verified}
                  onCheckedChange={(checked) =>
                    setConfirmations({ ...confirmations, verified: !!checked })
                  }
                />
                <label htmlFor="verified" className="text-sm font-medium cursor-pointer">
                  New owner has been verified
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="certificate"
                  checked={confirmations.certificate}
                  onCheckedChange={(checked) =>
                    setConfirmations({ ...confirmations, certificate: !!checked })
                  }
                />
                <label htmlFor="certificate" className="text-sm font-medium cursor-pointer">
                  Transfer certificate will be generated
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  ❌ Cancel
                </Button>
                <Button onClick={handleTransfer}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Transfer
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
