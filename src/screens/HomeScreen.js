import * as React from "react";
import { View, Text, Image } from "react-native";

import { Auth } from "aws-amplify";

import { useNavigation } from "@react-navigation/native";

import { Button, Input, Icon } from "react-native-elements";

import Container from "../components/Container";

import email from "../assets/email.png";
import profile from "../assets/profile.png";
import lock from "../assets/lock.png";

function HomeScreen() {
  const { navigate } = useNavigation();

  const handleSignOut = () => {
    Auth.signOut({ global: true })
      .then(
        () => navigate("Login"),
        setTimeout(() => {}, 1000),
        console.log("successful logout")
      )
      .catch((err) => console.log(err));
  };

  return (
    <Container containerStyle={{ paddingRight: 35, paddingLeft: 35 }}>
      {/* <Image source={email} style={{ marginBottom: 30, marginTop: 150 }} /> */}
      <Text style={{ fontSize: 18, textAlign: "center", marginTop: 300 }}>
        HOME SCREEN
      </Text>
      <Button
        title="Logout"
        buttonStyle={{
          backgroundColor: "#00847A",
          width: 134,
          height: 35,
          marginBottom: 24,
          marginTop: 31,
        }}
        titleStyle={{
          fontSize: 12,
        }}
        // onPress={confirmSignIn}
        onPress={handleSignOut}
      />
    </Container>
  );
}

export default HomeScreen;
