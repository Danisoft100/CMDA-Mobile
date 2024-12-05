import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-swiper";
import Button from "~/components/form/Button";
import { palette, typography } from "~/theme";

const OnboardingScreen = ({ navigation }: any) => {
  type SlideProps = {
    name: string;
    subtitle: string;
    image: any;
  };

  const SLIDES: SlideProps[] = [
    {
      name: "Welcome to CMDA Nigeria!",
      subtitle:
        "Join a network of Christian medical and dental professionals dedicated to caring for the whole person—spirit, soul, and body.",
      image: require("~/assets/images/handshake.png"),
    },
    {
      name: "Become Part of Our Community",
      subtitle:
        "Connect with fellow doctors and students as we provide opportunities for spiritual and professional growth.",
      image: require("~/assets/images/onboarding-5.png"),
    },
    {
      name: "Engage in Medical Missions",
      subtitle:
        "Participate in medical outreach missions that provide care to underserved communities.",
      image: require("~/assets/images/onboarding.jpg"),
    },
    {
      name: "Equip Yourself for Leadership",
      subtitle:
        "Our training programs prepare you for leadership in your profession and community.",
      image: require("~/assets/images/onboarding-5.png"),
    },
  ];

  const SliderComponent = ({ name, subtitle, image }: SlideProps) => (
    <View style={[styles.slide]}>
      <Text style={[typography.text2xl, typography.fontSemiBold, { textAlign: "center" }]}>{name}</Text>
      <View style={styles.slideImageContainer}>
        <Image source={image} style={styles.slideImage} />
      </View>
      <Text style={[typography.textBase, typography.fontMedium, { textAlign: "center", marginBottom: 24 }]}>
        {subtitle}
      </Text>
      <Button label="Create new account" onPress={() => navigation.navigate("sign-up")} style={{ width: "100%" }} />
      <View style={{ flexDirection: "row" }}>
        <Text style={[typography.textBase, typography.fontSemiBold, { marginRight: 4 }]}>Have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("sign-in")}>
          <Text style={[typography.textBase, typography.fontSemiBold, { color: palette.primary }]}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <Swiper showsButtons={false} autoplay loop={false} autoplayTimeout={5}>
        {SLIDES.map((item) => (
          <SliderComponent key={item.name} name={item.name} subtitle={item.subtitle} image={item.image} />
        ))}
      </Swiper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: palette.background },
  slideContainer: {},
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 10,
  },
  slideImageContainer: {
    backgroundColor: palette.onPrimary,
    height: 240,
    width: 240,
    borderRadius: 150,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
    overflow: 'hidden',
  },
  slideImage: { width: "100%", height: 180 },
});

export default OnboardingScreen;
