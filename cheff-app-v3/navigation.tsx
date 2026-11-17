import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./Home";
import Details from "./Details";

// lists my screens + what info each one needs. Home needs nothing, Details needs the dishes
export type RootStackParamList = {
  Home: undefined;
  Details: { menuItems: any[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splash}>
        <Image
          source={require("./assets/icon.png")}
          style={styles.splashIcon}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    // the stack = screens pile on top of each other, back button pops you back
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Details" component={Details} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  splashIcon: {
    width: 200,
    height: 200,
  },
});
