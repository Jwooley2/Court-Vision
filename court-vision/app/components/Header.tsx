import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid #333",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        Court Vision
      </Link>

      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link href="/players">Players</Link>
        <Link href="/rankings">Rankings</Link>
        <Link href="/starting-five">Starting Five</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/simulator">Simulator</Link>
      </nav>
    </header>
  );
}