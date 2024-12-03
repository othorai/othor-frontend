import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronLeft, Database, KeyRound, Table } from 'lucide-react';

interface ConnectDataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ConnectDataSourceModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: ConnectDataSourceModalProps) {
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState('snowflake');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    database: '',
    schema: '',
    table_name: '',
    host: '',
    port: '',
    account: '',
    warehouse: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      source_type: sourceType,
      ...formData
    });
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      username: '',
      password: '',
      database: '',
      schema: '',
      table_name: '',
      host: '',
      port: '',
      account: '',
      warehouse: '',
    });
    onClose();
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return sourceType && formData.name;
      case 2:
        if (sourceType === 'snowflake') {
          return formData.account && formData.warehouse;
        }
        return formData.host && formData.port;
      case 3:
        return formData.username && formData.password;
      case 4:
        return formData.database && formData.schema && formData.table_name;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Source Type</Label>
              <Select value={sourceType} onValueChange={setSourceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="snowflake">Snowflake</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Connection Name</Label>
              <Input
                placeholder="Give your connection a name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
        );

      case 2:
        return sourceType === 'snowflake' ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Account Identifier</Label>
              <Input
                placeholder="Your Snowflake account identifier"
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Warehouse</Label>
              <Input
                placeholder="Warehouse name"
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Host</Label>
              <Input
                placeholder="Database host"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                type="number"
                placeholder="Port number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                placeholder="Database username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Database password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Database</Label>
              <Input
                placeholder="Database name"
                value={formData.database}
                onChange={(e) => setFormData({ ...formData, database: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Schema</Label>
              <Input
                placeholder="Schema name"
                value={formData.schema}
                onChange={(e) => setFormData({ ...formData, schema: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Table Name</Label>
              <Input
                placeholder="Table name"
                value={formData.table_name}
                onChange={(e) => setFormData({ ...formData, table_name: e.target.value })}
              />
            </div>
          </div>
        );
    }
  };

  const stepTitles = [
    'Choose Source Type',
    'Connection Details',
    'Authentication',
    'Database Selection'
  ];

  const stepIcons = [
    <Database className="w-5 h-5" key="database" />,
    <ChevronRight className="w-5 h-5" key="details" />,
    <KeyRound className="w-5 h-5" key="key" />,
    <Table className="w-5 h-5" key="table" />
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Data Source</DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex flex-col items-center w-1/4 ${
                stepNumber < step
                  ? 'text-primary'
                  : stepNumber === step
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-full border-2 border-current">
                {stepIcons[stepNumber - 1]}
              </div>
              <span className="text-xs text-center">{stepTitles[stepNumber - 1]}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!isStepComplete()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={!isStepComplete() || isLoading}>
                {isLoading ? "Connecting..." : "Connect"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}