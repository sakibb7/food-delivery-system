import Header from "@/components/layout/Header";
import FooterSection from "@/components/layout/footer";

export default function WhoWeArePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-16 px-6 lg:px-12 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Who We Are</h1>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            Welcome to Tekina Food Delivery, your ultimate destination for discovering and enjoying the best food around you.
            We are passionate about connecting hungry diners with top-quality local restaurants.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
          <p>
            Our mission is to elevate the dining experience by making food discovery and delivery seamless,
            fast, and reliable. Whether you're craving a gourmet burger, authentic sushi, or a quick healthy salad,
            we strive to bring your favorite meals straight to your door with unmatched convenience.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Wide Selection:</strong> Thousands of restaurants at your fingertips.</li>
            <li><strong>Lightning Fast:</strong> We prioritize speedy delivery to keep your food hot and fresh.</li>
            <li><strong>User-Friendly:</strong> An intuitive app designed with your convenience in mind.</li>
            <li><strong>Community Driven:</strong> We support local businesses and foster community growth.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Join Our Journey</h2>
          <p>
            We are constantly growing and looking for ways to improve your experience.
            Join our community of food lovers today and discover the endless culinary possibilities
            waiting just a tap away.
          </p>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
