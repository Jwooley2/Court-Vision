import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="site-logo">
        Court Vision
      </Link>

      <nav className="site-nav">
        <Link href="/players">Players</Link>
        <Link href="/rankings">Rankings</Link>
        <Link href="/starting-five">Starting Five</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/simulator">Simulator</Link>
      </nav>
    </header>
  );
}