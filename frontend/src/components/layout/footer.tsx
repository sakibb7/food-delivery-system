import Logo from "../ui/Logo";
import Link from "next/link";


export default function FooterSection() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-16 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
                <div className="md:col-span-1">
                    <Logo />
                    <p className="text-gray-400 mb-6 text-sm">
                        By continuing past this page, you agree to our Terms of Service,
                        Cookie Policy, Privacy Policy and Content Policies.
                    </p>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer text-white font-bold">
                            f
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer text-white font-bold">
                            t
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer text-white font-bold">
                            in
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 tracking-wide">
                        ABOUT TOMATO
                    </h4>
                    <ul className="space-y-3 font-medium text-sm">
                        <li>
                            <Link href="/who-we-are" className="hover:text-white transition-colors">
                                Who We Are
                            </Link>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Blog
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Work With Us
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Investor Relations
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Report Fraud
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 tracking-wide">
                        FOR RESTAURANTS
                    </h4>
                    <ul className="space-y-3 font-medium text-sm">
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Partner With Us
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Apps For You
                            </a>
                        </li>
                    </ul>
                    <h4 className="text-white font-bold mb-6 mt-8 tracking-wide">
                        FOR ENTERPRISES
                    </h4>
                    <ul className="space-y-3 font-medium text-sm">
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Tomato For Enterprise
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 tracking-wide">
                        LEARN MORE
                    </h4>
                    <ul className="space-y-3 font-medium text-sm">
                        <li>
                            <Link href="/privacy" className="hover:text-white transition-colors">
                                Privacy
                            </Link>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Security
                            </a>
                        </li>
                        <li>
                            <Link href="/terms" className="hover:text-white transition-colors">
                                Terms
                            </Link>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Sitemap
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-gray-800 mt-12 pt-8 text-sm text-gray-500 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
                <p>© 2026 Tomato Food Delivery. All rights reserved.</p>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <span>Made with</span>
                    <span className="text-red-500 text-lg">♥</span>
                    <span>for foodies everywhere</span>
                </div>
            </div>
        </footer>
    )
}
