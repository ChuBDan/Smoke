import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useDispatch, useSelector } from "react-redux";
import { loadUserFromStorage } from "../redux/slices/authSlice";

// Import navigators
import MainTabNavigator from "./MainTabNavigator";

// Import screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import SplashScreens from "../screens/SplashScreens";
import MembershipScreen from "../screens/member/MembershipScreen";
import SmokingCessationScreen from "../screens/member/SmokingCessationScreen";
import ProfileEditScreen from "../screens/ProfileEditScreen";
import SmokingStatusFormScreen from "../screens/SmokingStatusFormScreen";
import BookAppointmentScreen from "../screens/BookAppointmentScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      await dispatch(loadUserFromStorage());
      setIsInitializing(false);
    };

    initializeApp();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreens} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#ffffff" },
        }}
      >
        {isAuthenticated ? (
          // Authenticated screens
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="Membership" component={MembershipScreen} />
            <Stack.Screen
              name="SmokingCessation"
              component={SmokingCessationScreen}
            />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            <Stack.Screen
              name="SmokingStatusForm"
              component={SmokingStatusFormScreen}
            />
            <Stack.Screen
              name="BookAppointment"
              component={BookAppointmentScreen}
            />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
