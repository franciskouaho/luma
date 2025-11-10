import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../src/theme/colors";

const TAB_BAR_BACKGROUND = "rgba(30, 30, 30, 0.95)";
const TAB_BAR_INACTIVE = "rgba(255, 255, 255, 0.6)";

const RoundedTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const options = descriptors[route.key]?.options;

          if (
            options?.href === null ||
            options?.tabBarButton === null ||
            typeof options?.tabBarButton === "function"
          ) {
            return null;
          }

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({
                name: route.name,
                params: route.params,
                merge: true,
              } as any);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const activeColor =
            options?.tabBarActiveTintColor ?? colors.primary;
          const inactiveColor =
            options?.tabBarInactiveTintColor ?? TAB_BAR_INACTIVE;
          const color = isFocused ? activeColor : inactiveColor;

          const icon =
            options?.tabBarIcon?.({
              focused: isFocused,
              color,
              size: 26,
            }) ?? (
              <Ionicons name="ellipse-outline" color={color} size={26} />
            );

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel}
              testID={options?.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.85}
            >
              <View style={styles.iconWrapper}>{icon}</View>
              <View style={[styles.dot, isFocused && styles.dotActive]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function TabLayout() {
  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => <RoundedTabBar {...props} />,
    []
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: TAB_BAR_INACTIVE,
        tabBarStyle: { display: "none" },
        tabBarLabel: "",
      }}
      tabBar={renderTabBar}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarLabel: "",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: "Générer",
          tabBarLabel: "",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "color-wand" : "color-wand-outline"}
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: "Mes Idées",
          tabBarLabel: "",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bulb" : "bulb-outline"}
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarLabel: "",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={26}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: TAB_BAR_BACKGROUND,
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    backgroundColor: "transparent",
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
});
