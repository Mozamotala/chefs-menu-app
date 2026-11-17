// all my reusable stuff lives here - written once, used on the Home and Details screens
import { StyleSheet, TextInput, View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// what one dish looks like - shared by Home, Details and navigation
export interface MenuItem {
  id: string;
  name: string;
  time: string;
  description: string;
  price: string;
  dishType: string;
}

// the 4 dish types - value is what gets saved, label is what the chef sees
// used by the Home picker and the Details cards so they always match
export const dishTypes = [
  { value: "appetizer", label: "Appetizer" },
  { value: "mainCourse", label: "Main Course" },
  { value: "dessert", label: "Dessert" },
  { value: "beverage", label: "Beverage" },
];

// SEARCH: gives back only the dishes whose name has the search text in it
// ignores capitals and extra spaces. empty search = every dish
export function searchDishes(dishes: MenuItem[], searchText: string) {
  return dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchText.toLowerCase().trim()),
  );
}

// TOTAL: adds up the price of every dish (bad prices count as 0)
export function getTotalPrice(dishes: MenuItem[]) {
  return dishes.reduce((sum, dish) => sum + (parseFloat(dish.price) || 0), 0);
}

// AVERAGE: total divided by how many dishes. 0 if there are none (no NaN)
export function getAveragePrice(dishes: MenuItem[]) {
  return dishes.length > 0 ? getTotalPrice(dishes) / dishes.length : 0;
}

// SAVE: stores the dish list on the phone so it's still there after closing the app
export async function saveDishes(dishes: MenuItem[]) {
  await AsyncStorage.setItem("@dishes", JSON.stringify(dishes));
}

// SEARCH BAR: the same search box for both screens
// value = what's typed, onChange = what to do when the user types
export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    // wrapper View so the ✕ can sit on top of the search box
    <View>
      <TextInput
        value={value}
        style={styles.searchBar}
        placeholder="Search dishes..."
        placeholderTextColor="#888"
        onChangeText={onChange}
      />
      {/* ✕ only shows when something is typed - tapping it empties the search.
          onChange("") is the same as the user deleting all the text,
          so the screen goes back to showing every dish */}
      {value !== "" && (
        <TouchableOpacity style={styles.clearButton} onPress={() => onChange("")}>
          <Text style={styles.clearButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    borderWidth: 1,
    borderColor: "#ff506a",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    paddingRight: 40, // room for the ✕ so text doesn't go under it
  },
  // the ✕ button - absolute so it floats inside the search box instead of under it
  clearButton: {
    position: "absolute",
    right: 15, // distance from the right edge of the box
    top: 10, // lines it up with the typed text
  },
  clearButtonText: {
    fontSize: 18,
    color: "#888", // same grey as the placeholder
  },
});
