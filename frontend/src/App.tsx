import { Route, Switch } from 'wouter';
import { WorkoutTracker } from './pages/WorkoutTracker';
import { VerifyEmail } from './pages/VerifyEmail';
import { UpdateUser } from './pages/UpdateUser';
import { OAuthCallback } from './pages/OAuthCallback';

const App = () => {
  return (
    <Switch>
      <Route path="/update-user" component={UpdateUser} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/oauth-callback" component={OAuthCallback} />
      <Route path="/" component={WorkoutTracker} />
    </Switch>
  );
};

export default App;
