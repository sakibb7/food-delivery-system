import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center py-12">
        <CardContent className="flex flex-col items-center justify-center space-y-6">
          <div className="h-20 w-20 bg-orange-50 rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">404</h1>
            <h2 className="text-xl font-semibold text-gray-700">Page Not Found</h2>
            <p className="text-gray-500 text-sm max-w-[250px] mx-auto">
              The page you are looking for doesn't exist or you don't have permission to access it.
            </p>
          </div>
          <Link
            to="/"
            className="px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Go to Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
