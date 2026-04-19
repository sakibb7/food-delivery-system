import { Redirect } from 'expo-router';

export default function Index() {
  // For demo purposes, we automatically redirect to the authentication flow.
  // In a real app, you would check if the user is authenticated here.
  return <Redirect href="/(auth)" />;
}
