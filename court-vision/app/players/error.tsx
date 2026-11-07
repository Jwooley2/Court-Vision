"use client";

import Link from "next/link";

export default function PlayerDataError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <div role="alert" style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Player data temporarily unavailable</h1>
      <p>We could not load the player data. Please try again shortly.</p>
      <button onClick={() => unstable_retry()}>Try again</button>
      <p><Link href="/players">Back to players</Link></p>
    </div>
  );
}
