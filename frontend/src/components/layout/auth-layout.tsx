import Image, { StaticImageData } from "next/image";
import burger from "../../../public/burger.png";
import pizza from "../../../public/pizza.png";
import sushi from "../../../public/sushi.png";
import heroBg from "../../../public/hero-bg.png";
import Logo from "@/components/ui/Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  image?: StaticImageData;
  statsText?: string;
}

export default function AuthLayout({
  children,
  title = "Join thousands of foodies today.",
  description = "Get exclusive access to the best restaurants in town, track your orders in real-time, and earn rewards points with every meal.",
  image = heroBg,
  statsText = "Join 10,000+ others",
}: AuthLayoutProps) {
  return (
    <main className="">
      <section className="container min-h-screen">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 py-6 lg:col-span-5">
            <div className="flex h-full flex-col items-start justify-between gap-8 sm:gap-10 lg:gap-20">
              <Logo />

              {children}
            </div>
          </div>
          <div className="2xl:col-starts-8 relative col-span-6 max-lg:hidden lg:ml-20">
            <div className="fixed top-0 right-0 bottom-0 w-1/2">
              <div className="absolute inset-0 m-4 rounded-[2.5rem] overflow-hidden">
                <div className=" bg-linear-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                <Image
                  src={image}
                  alt="Sign up delicious background"
                  className="object-cover object-center w-full h-full"
                  priority
                />
                <div className="absolute bottom-16 left-16 right-16 z-20 text-white bg-black/70 rounded-2xl p-6">
                  <h2 className="text-4xl font-extrabold mb-4 leading-tight">
                    {title}
                  </h2>
                  <p className="text-lg text-gray-300 font-medium">
                    {description}
                  </p>

                  <div className="flex items-center gap-4 mt-8">
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-300 overflow-hidden">
                        <Image
                          src={burger}
                          width={40}
                          height={40}
                          alt="user"
                          className="object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-400 overflow-hidden">
                        <Image
                          src={pizza}
                          width={40}
                          height={40}
                          alt="user"
                          className="object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-500 overflow-hidden">
                        <Image
                          src={sushi}
                          width={40}
                          height={40}
                          alt="user"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <p className="font-semibold text-sm">{statsText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
