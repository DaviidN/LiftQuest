import { Route, Switch } from 'wouter';
import { WorkoutTracker } from './pages/WorkoutTracker';
import { VerifyEmail } from './pages/VerifyEmail';

const App = () => {
  return (
    <Switch>
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/" component={WorkoutTracker} />
    </Switch>
  );
};

export default App;
