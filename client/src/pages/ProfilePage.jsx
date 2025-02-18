import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export function ProfilePage({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect only if user is null
    }
  }, [user, navigate]);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome, {user.username}!</h2>
    </div>
  );
}
