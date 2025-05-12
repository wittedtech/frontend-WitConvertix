import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Billing() {
  useEffect(() => {
    toast.info("Billing page is under development. Check back soon!", {
      duration: 3000,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Billing details will be implemented soon. Check back for Pro plan
              options.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
