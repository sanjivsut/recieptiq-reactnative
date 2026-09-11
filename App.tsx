import { useCallback, useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, IBMPlexMono_400Regular, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from "@expo-google-fonts/ibm-plex-mono";
import { Oswald_400Regular, Oswald_600SemiBold, Oswald_700Bold } from "@expo-google-fonts/oswald";
import { ActivityIndicator, View } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

import { ScanScreen } from "./screens/ScanScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { AboutScreen } from "./screens/AboutScreen";
import { Icon } from "./components/Icon";
import { colors } from "./theme";

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.paperCream,
    card: colors.paperWhite,
    border: colors.inkNavy,
    primary: colors.stampRed,
    text: colors.inkNavy,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
    Oswald_400Regular,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paperCream }}>
        <ActivityIndicator color={colors.inkNavy} />
      </View>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayout}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.stampRed,
            tabBarInactiveTintColor: colors.greyBrown,
            tabBarStyle: { backgroundColor: colors.paperWhite, borderTopColor: colors.inkNavy },
            tabBarIcon: ({ color, size }) => {
              const name = route.name === "Scan" ? "scan" : route.name === "History" ? "search" : "info";
              return <Icon name={name} size={size ?? 20} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Scan" component={ScanScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="About" component={AboutScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
