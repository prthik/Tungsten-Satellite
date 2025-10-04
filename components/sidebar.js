import Link from "next/link";

export default function Sidebar() {
    return (
        <div className="flex flex-col w-64 min-h-screen border-r border-neutral-500 bg-neutral-900 shrink-0">
            <div className="py-8 px-6 space-y-6">
                <div className="hover:underline cursor-pointer">
                    <Link href={"/"}>Home</Link>
                </div>
                <div className="hover:underline cursor-pointer">
                   <Link href={"/orrery"}>Orbit Map</Link>
                </div>
                <div className="hover:underline cursor-pointer">
                    <Link href={"/data"}>Orbit Data</Link>
                </div>
            </div>
        </div>
    )
}