import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import functions from "@react-native-firebase/functions";

// React Native Firebase initializes automatically from google-services.json and GoogleService-Info.plist
// No manual initialization needed!

// Export Firebase services
export const db = firestore();
export { auth };
export { functions };

// Export auth instance for convenience
export default auth();
