import Header from "@/components/layout/Header";
import FooterSection from "@/components/layout/footer";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-16 px-6 lg:px-12 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Terms and Conditions</h1>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 text-gray-700 leading-relaxed">
          <p className="text-sm text-gray-500 mb-6">Last Updated: April 2026</p>

          <p>
            Welcome to Tekina! These Terms and Conditions outline the rules and regulations for the use of
            Tekina's Website and Mobile Application.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing this application, we assume you accept these terms and conditions in full.
            Do not continue to use Tekina's application if you do not accept all of the terms and conditions
            stated on this page.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Services Description</h2>
          <p>
            Tekina provides a platform for users to discover, order, and pay for food from participating restaurants.
            Tekina acts as an intermediary between you and the restaurant. We do not prepare the food and are not
            responsible for the quality of the food provided by the restaurants.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
          <p>
            To use certain features of the application, you must register for an account. You are responsible for
            maintaining the confidentiality of your account information, including your password, and for all
            activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Payment and Fees</h2>
          <p>
            All prices are listed on the application. We reserve the right to change prices at any time.
            Delivery fees and service fees may apply and will be displayed during checkout. All payments
            are processed securely through third-party payment gateways.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Limitation of Liability</h2>
          <p>
            In no event shall Tekina, nor any of its officers, directors, and employees, be liable to you for
            anything arising out of or in any way connected with your use of this application.
          </p>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
