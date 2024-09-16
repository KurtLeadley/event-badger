// /frontend/App.js
import React, { useEffect } from 'react';
import { NativeModules } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider } from './context/UserContext';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';

import AdminLoginScreen from './screens/AdminLoginScreen';
import SelectModeScreen from './screens/SelectModeScreen';
import SelectEventScreen from './screens/SelectEventScreen';
import SelectSubEventScreen from './screens/SelectSubEventScreen';
import PrintBadgeScreen from './screens/PrintBadgeScreen';
import QRScan from './screens/QRScan';
import RegisterScreen from './screens/RegistrationScreen';
import RequestPasswordResetScreen from './screens/RequestPasswordResetScreen';
import ResetPasswordWithCodeScreen from './screens/ResetPasswordWithCodeScreen';
import SetPinScreen from './screens/SetPinScreen';
import SelectPrinterScreen from './screens/SelectPrinterScreen';

const Stack = createNativeStackNavigator();
const { ServerModule } = NativeModules;

export default function App() {
  useEffect(() => {
    if (__DEV__) {
      console.log("Running in development mode");
    } else {
      console.log("Running in production mode");
    }
    const setupServers = async () => {
      try {
        const getLocalIpAddress = async () => {
          try {
            const ipAddress = await DeviceInfo.getIpAddress();
            return ipAddress;
          } catch (error) {
            console.error('Error getting IP address:', error);
            return null;
          }
        };

        const ipAddress = (await getLocalIpAddress()) || '192.168.8.209';
        console.log(`Starting services with IP address: ${ipAddress}`);

        // Ensure the IP address is written to the .env file
        const envRootPath = `${RNFS.DocumentDirectoryPath}/.env`;
        let envContent = await RNFS.readFile(envRootPath, 'utf-8').catch(() => '');
        if (!envContent.includes('API_IP_ADDRESS')) {
          envContent += `\nAPI_IP_ADDRESS=${ipAddress}\n`;
        } else {
          envContent = envContent.replace(/API_IP_ADDRESS=.*/g, `API_IP_ADDRESS=${ipAddress}`);
        }
        await RNFS.writeFile(envRootPath, envContent);

        // Start servers with the IP address
       ServerModule.startPythonServer(ipAddress);
       ServerModule.startNodeServer(ipAddress);
      } catch (error) {
        console.error('Error setting up servers:', error);
      }
    };

    setupServers();
  }, []);

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="AdminLoginScreen"
          screenOptions={{
            gestureEnabled: false, // Disable swipe back gestures globally
          }}
        >
          <Stack.Screen
            name="AdminLoginScreen"
            component={AdminLoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SelectModeScreen"
            component={SelectModeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SelectEventScreen"
            component={SelectEventScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SelectSubEventScreen"
            component={SelectSubEventScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="QRScan"
            component={QRScan}
            options={{ headerTitle: "ADG Event Badger"}}
          />
          <Stack.Screen
            name="PrintBadgeScreen"
            component={PrintBadgeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RegisterScreen"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RequestPasswordResetScreen"
            component={RequestPasswordResetScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ResetPasswordWithCodeScreen"
            component={ResetPasswordWithCodeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SetPinScreen"
            component={SetPinScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SelectPrinterScreen"
            component={SelectPrinterScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}


