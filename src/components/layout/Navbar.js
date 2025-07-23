{!isAuthenticated && (
  <div className="auth-buttons">
    <Link to="/login" className="btn btn-outline">Login</Link>
    {/* Remove the register button */}
    {/* <Link to="/register" className="btn btn-primary">Register</Link> */}
  </div>
)}