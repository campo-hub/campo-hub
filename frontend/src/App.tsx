import NavBar from './components/NavBar';

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ListingDetails from './pages/ListingDetails';
import PostListing from './pages/PostListing';
import Chat from './pages/Chat';
import Groups from './pages/Groups';
import Profile from './pages/Profile';
import Ratings from './pages/Ratings';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Subscription from './pages/Subscription';
import Services from './pages/Services.tsx';
import PostService from './pages/PostService.tsx';
import Events from './pages/Events.tsx';
import AddEvent from './pages/AddEvent.tsx';

import NotFound from './pages/NotFound';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <>
      <NavBar />
      <div className="page-wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/post-listing" element={<RequireAuth><PostListing /></RequireAuth>} />
          <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/services" element={<Services />} />
          <Route path="/post-service" element={<RequireAuth><PostService /></RequireAuth>} />
          <Route path="/events" element={<Events />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/ratings" element={<RequireAuth><Ratings /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/add-event" element={<RequireAuth role="admin"><AddEvent /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/subscription" element={<RequireAuth><Subscription /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
