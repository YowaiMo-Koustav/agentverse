
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Manage API keys for integrating with external services.</p>
          <Button className="mt-4 button-enhanced">Generate New Key</Button>
        </CardContent>
      </Card>
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Configure your notification preferences.</p>
          <Button className="mt-4 button-enhanced">Update Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
