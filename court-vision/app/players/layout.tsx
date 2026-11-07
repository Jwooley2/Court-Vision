import { isPreviewFixtureMode } from "@/lib/preview-fixtures";

export default function PlayersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {isPreviewFixtureMode() && (
        <aside role="note" style={{ padding: "1rem 2rem", border: "2px solid #d6a53a" }}>
          <strong>Test preview — sample data only.</strong>{" "}
          These fictional players and numbers are for testing. Live player records are not connected.
        </aside>
      )}
      {children}
    </>
  );
}
