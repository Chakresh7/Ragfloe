export function LogoutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className="logout-btn">
        Log out
      </button>
    </form>
  );
}
