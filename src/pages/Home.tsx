import { useProgress } from '../stores/progress';
import Onboarding from '../components/Onboarding';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const { isOnboarded } = useProgress();

  if (!isOnboarded) {
    return <Onboarding />;
  }

  return <Dashboard />;
}
