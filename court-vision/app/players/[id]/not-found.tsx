import Link from "next/link";

export default function PlayerNotFound() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Player not found</h1>
      <p>There is no player at this address.</p>
      <Link href="/players">Back to players</Link>
    </div>
  );
}
