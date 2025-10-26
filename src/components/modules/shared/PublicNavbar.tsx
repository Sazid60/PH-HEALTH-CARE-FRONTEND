import Link from "next/link";

const PublicNavbar = () => {
    return (
        <header>
            <div>
                <Link  href="/" className=" flex items-center justify-center text-xl font-bold text-primary">PH-Health</Link>
            </div>
        </header>
    );
};

export default PublicNavbar;