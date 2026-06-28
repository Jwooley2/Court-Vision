import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
        Court Vision
      </h1>

      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        Discover, organize, test, and share your basketball philosophy.
      </p>

      <div style={{ display: "grid", gap: "1rem", maxWidth: "700px" }}>
        <Link href="/players" style={cardStyle}>
          <h2>Players</h2>
          <p>Search and explore the player database.</p>
        </Link>

        <Link href="/rankings" style={cardStyle}>
          <h2>Rankings</h2>
          <p>Create GOAT lists, position rankings, and era rankings.</p>
        </Link>

        <Link href="/starting-five" style={cardStyle}>
          <h2>Starting Five</h2>
          <p>Build your all-time starting lineup.</p>
        </Link>

        <Link href="/compare" style={cardStyle}>
          <h2>Compare</h2>
          <p>Compare players by career, season, era, or custom weights.</p>
        </Link>

        <Link href="/simulator" style={cardStyle}>
          <h2>Simulator</h2>
          <p>Run matchups and test teams against your friends.</p>
        </Link>
      </div>
    </main>
  );
}

const cardStyle = {
  display: "block",
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "1rem",
  textDecoration: "none",
  color: "inherit",
};