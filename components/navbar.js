import Link from "next/link";

export default function Navbar() {
    return (
        <div className="flex w-full justify-between py-6 px-10 border-b bg-neutral-950 border-neutral-500">
            <div className="text-2xl font-bold">
            <Link href={"/"}>Tungsten Orbit</Link>
            </div>
            <div className="hover:underline cursor-pointer">
                <Link href={"/alerts"}>Alerts</Link>
            </div>
        </div>
    );
}
