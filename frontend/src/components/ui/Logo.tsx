import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className=" flex items-center gap-2 group z-10 w-fit">
      <div className="bg-red-600 group-hover:bg-red-700 text-white size-9  rounded-xl font-bold text-xl tracking-tight transition-colors flex justify-center items-center">
        <span>T</span>
      </div>
      <span className="font-extrabold text-2xl tracking-tight text-gray-900 group-hover:text-red-700 transition-colors">
        Tomato.
      </span>
    </Link>
  );
}
