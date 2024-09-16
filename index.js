import { AppRegistry } from 'react-native';
import App from './frontend/App';

const appName = "eventbadger"; // Replace with your actual app name

console.log('Starting the application...');

if (__DEV__) {
    console.log('Running in development mode');
} else {
    console.log('Running in production mode');
}

// Register the root component of the app
AppRegistry.registerComponent(appName, () => App);

console.log('App component has been registered.');

