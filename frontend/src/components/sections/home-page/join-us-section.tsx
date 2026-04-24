import Image from "next/image";

export default function JoinUsSection() {
  const cards = [
    {
      title: "List Your Restaurant on Foodi",
      description:
        "Would you like millions of new customers to enjoy your amazing food and groceries? Let's start our partnership today!",
      buttonText: "Become a Partner",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800&h=600",
      link: "#",
    },
    {
      title: "Become A Foodi Hero",
      description:
        "Are you a man of speed and a master of navigation? Become a Foodi Hero and earn up to 25,000 TK each month while spreading joy to the doorsteps.",
      buttonText: "Become a Hero",
      image: "https://images.unsplash.com/photo-1632154917424-6028c2e6f98c?auto=format&fit=crop&q=80&w=800&h=600",
      link: "#",
    },
  ];

  return (
    <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
      <div className="grid md:grid-cols-2 gap-8">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col md:flex-row h-full group"
          >
            <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                {card.title}
              </h3>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                {card.description}
              </p>
              <div>
                <button className="bg-[#E60000] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-md hover:shadow-red-600/20">
                  {card.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
