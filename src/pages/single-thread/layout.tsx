import Link from "next/link"

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="flex w-full bg-blue-300 p-5 pl-20">
                <p className="text-xl">
                    Single Thread
                </p>
            </div>
            {children}
            <div className="w-full bg-sky-600">
            </div>
        </div >
    )
}
