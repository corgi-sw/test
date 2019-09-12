import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import Index from "../screens/Index";
import Chat from "../screens/Chat";

const MainStackNavigator = createStackNavigator(
  {
    index: {
      screen: Index,
      navigationOptions: ({ navigation }) => {
        return {
          header: null
        };
      }
    },
    chat: {
      screen: Chat,
      navigationOptions: ({ navigation }) => {
        return {
          headerStyle: {
            borderBottomWidth: 0,
            backgroundColor: "white"
          },
          headerTintColor: "black",
          headerTitle: ""
        };
      }
    }
    /*
    signup: {
      screen: Signup,
      navigationOptions: ({ navigation }) => {
        return {
          headerStyle: {
            borderBottomWidth: 0,
            backgroundColor: "white"
          },
          headerTintColor: "black",
          headerTitle: "회원가입"
        };
      }
    }*/
  },
  {
    headerMode: "screen",
    headerBackTitleVisible: false
  }
);

export default MainStackContainer = createAppContainer(
  MainStackNavigator
);
