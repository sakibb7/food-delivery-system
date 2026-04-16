import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure global application parameters.</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Save Changes
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission & Fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Platform Commission (%)</label>
              <input 
                type="number" 
                defaultValue={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
              />
              <p className="text-xs text-gray-500">Base commission charged on every order.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Delivery Base Fee (₹)</label>
              <input 
                type="number" 
                defaultValue={40}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
              />
              <p className="text-xs text-gray-500">Base delivery fee for up to 3km.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Extra per KM (₹)</label>
              <input 
                type="number" 
                defaultValue={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
              />
              <p className="text-xs text-gray-500">Fee charged per km beyond the base distance.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>System Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Maintenance Mode</p>
                <p className="text-sm text-gray-500">Disable customer orders temporarily across the platform.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
