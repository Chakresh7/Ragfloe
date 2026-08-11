import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-shell">
      <div className="app-page">
        <div className="coming-soon">
          <h1>Not found</h1>
          <p>That organization or project does not exist in the mock data.</p>
          <p style={{ marginTop: "1rem" }}>
            <Link href="/organizations">Back to organizations</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
