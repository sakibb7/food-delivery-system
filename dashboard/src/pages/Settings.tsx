import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { useGetQuery } from "../hooks/mutate/useGetQuery";
import { useQueryMutation } from "../hooks/mutate/useQueryMutation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CreditCard, CheckCircle } from "lucide-react";

export default function Settings() {
  const { data: settings, isLoading } = useGetQuery({
    url: "/settings",
    queryKey: "settings",
  });

  const { mutate, isLoading: isUpdating } = useQueryMutation({
    url: "/settings",
    method: "PUT",
  });

  const [formData, setFormData] = useState<any>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
      setIsDirty(false);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    mutate(formData, {
      onSuccess: () => {
        toast.success("Settings updated successfully");
        setIsDirty(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure global application parameters.</p>
        </div>
        <div className="flex items-center gap-4">
          {isDirty && (
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isUpdating || !isDirty}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text" name="company_name" value={formData.company_name || ""} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Support Email</label>
              <input
                type="email" name="support_email" value={formData.support_email || ""} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Website URL</label>
              <input
                type="url" name="website_url" value={formData.website_url || ""} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Support Phone</label>
              <input
                type="text" name="support_phone" value={formData.support_phone || ""} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Timezone</label>
              <input
                type="text" name="timezone" value={formData.timezone || ""} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">App URL</label>
              <input
                type="url" name="app_url" value={formData.app_url || ""} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700">Company Address</label>
              <input
                type="text" name="company_address" value={formData.company_address || ""} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Currency Symbol</label>
              <select
                name="currency_symbol"
                value={formData.currency_symbol || "$"}
                onChange={handleChange as any}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="₹">₹ (INR)</option>
                <option value="৳">৳ (BDT)</option>
                <option value="R$">R$ (BRL)</option>
                <option value="A$">A$ (AUD)</option>
                <option value="C$">C$ (CAD)</option>
                <option value="¥">¥ (JPY/CNY)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission & Fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Platform Commission (%)</label>
              <input
                type="number" name="platform_commission_rate" value={formData.platform_commission_rate ?? ""} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500">Base commission charged on every order.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tax Rate (%)</label>
              <input
                type="number" name="tax_rate" value={formData.tax_rate ?? ""} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500">Global tax rate applied to subtotal.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Delivery Base Fee ({formData.currency_symbol || "$"})</label>
              <input
                type="number" name="delivery_base_fee" value={formData.delivery_base_fee ?? ""} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500">Fallback base delivery fee.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Extra per KM ({formData.currency_symbol || "$"})</label>
              <input
                type="number" name="delivery_fee_per_km" value={formData.delivery_fee_per_km ?? ""} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500">Fee charged per km beyond the base distance.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle>Payment Gateway — Stripe</CardTitle>
            </div>
            {formData.stripe_enabled && formData.stripe_publishable_key && formData.stripe_secret_key ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <CheckCircle className="h-3.5 w-3.5" /> Connected
              </span>
            ) : formData.stripe_enabled ? (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Keys missing
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                Disabled
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Stripe Payments</p>
              <p className="text-sm text-gray-500">Allow customers to pay with credit/debit cards at checkout.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="stripe_enabled" checked={formData.stripe_enabled || false} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {formData.stripe_enabled && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="space-y-2 pt-4">
                <label className="text-sm font-medium text-gray-700">Publishable Key</label>
                <input
                  type="text" name="stripe_publishable_key" value={formData.stripe_publishable_key || ""} onChange={handleChange}
                  placeholder="pk_test_... or pk_live_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">Found in your Stripe Dashboard → Developers → API Keys.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Secret Key</label>
                <div className="relative">
                  <input
                    type={showSecretKey ? "text" : "password"} name="stripe_secret_key" value={formData.stripe_secret_key || ""} onChange={handleChange}
                    placeholder="sk_test_... or sk_live_..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Keep this secret. Never expose it in client-side code.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Webhook Signing Secret</label>
                <div className="relative">
                  <input
                    type={showWebhookSecret ? "text" : "password"} name="stripe_webhook_secret" value={formData.stripe_webhook_secret || ""} onChange={handleChange}
                    placeholder="whsec_..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Found in Stripe Dashboard → Developers → Webhooks. Required for payment confirmations.</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-700">
                  <strong>Webhook URL:</strong>{" "}
                  <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[11px]">{`${window.location.protocol}//${window.location.hostname}:5000/api/v1/stripe/webhook`}</code>
                </p>
                <p className="text-xs text-blue-600 mt-1">Add this URL in your Stripe Dashboard → Developers → Webhooks → Add endpoint.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Force Secure Password</p>
              <p className="text-sm text-gray-500">Require strong passwords for all users.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="force_secure_password" checked={formData.force_secure_password || false} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">KYC Verification</p>
              <p className="text-sm text-gray-500">Require KYC documents for riders and restaurants.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="kyc_verification" checked={formData.kyc_verification || false} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Phone Verification</p>
              <p className="text-sm text-gray-500">Require OTP verification for new signups.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="phone_verification" checked={formData.phone_verification || false} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Verification</p>
              <p className="text-sm text-gray-500">Require email verification link click.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="email_verification" checked={formData.email_verification || false} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Disable customer orders temporarily across the platform.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="maintenance_mode" checked={formData.maintenance_mode || false} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Save Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-transform duration-300 z-40 flex justify-between items-center ${
          isDirty ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            You have unsaved changes
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormData(settings);
              setIsDirty(false);
            }}
            disabled={isUpdating}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating || !isDirty}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
