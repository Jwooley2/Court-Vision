import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <h1 className="page-title">Court Vision</h1>

      <p className="page-subtitle">
        Discover, organize, test, and share your basketball philosophy.
      </p>

      <div className="card-grid">
        <Link href="/players" className="card">
          <h2>Players</h2>
          <p>Search and explore the player database.</p>
        </Link>

        <Link href="/rankings" className="card">
          <h2>Rankings</h2>
          <p>Create GOAT lists, position rankings, and era rankings.</p>
        </Link>

        <Link href="/starting-five" className="card">
          <h2>Starting Five</h2>
          <p>Build your all-time starting lineup.</p>
        </Link>

        <Link href="/compare" className="card">
          <h2>Compare</h2>
          <p>Compare players by career, season, era, or custom weights.</p>
        </Link>

        <Link href="/simulator" className="card">
          <h2>Simulator</h2>
          <p>Run matchups and test teams against your friends.</p>
        </Link>
      </div>
    </main>
  );
}
