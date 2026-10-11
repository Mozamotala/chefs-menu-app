import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Home';
import Details from './Details';

// lists my screens + what info each one needs. Home needs nothing, Details needs the dishes
export type RootStackParamList = {
    Home: undefined;
    Details: { menuItems: any[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    return (
        // the stack = screens pile on top of each other, back button pops you back
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
                <Stack.Screen name="Details" component={Details} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
